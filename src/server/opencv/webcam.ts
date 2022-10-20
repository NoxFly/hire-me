import cv, { Contour, Mat, Point, Point2, Vec4 } from '@u4/opencv4nodejs';


const skinColorUpper = (hue: number) => new cv.Vec3(hue, 0.8 * 255, 0.6 * 255);
const skinColorLower = (hue: number) => new cv.Vec3(hue, 0.1 * 255, 0.05 * 255);

const makeHandMask = (img: Mat) => {
    // filter by skin color
    const imgHLS = img.cvtColor(cv.COLOR_BGR2HLS);
    const rangeMask = imgHLS.inRange(skinColorLower(0), skinColorUpper(20));

    // remove noise
    const blurred = rangeMask.blur(new cv.Size(10, 10));
    const thresholded = blurred.threshold(200, 255, cv.THRESH_BINARY);

    return thresholded;
};

const getHandContour = (handMask: Mat) => {
    const contours = handMask.findContours(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    // largest contour
    return contours.sort((c0, c1) => c1.area - c0.area)[0];
};


// returns distance of two points
const ptDist = (pt1: Point, pt2: Point) => pt1.sub(pt2).norm();

// returns center of all points
const getCenterPt = (pts: Point2[]) => pts.reduce(
    (sum, pt) => sum.add(pt),
    new cv.Point2(0, 0)
).div(pts.length);


type hullPoint = { pt: Point2, contourIdx: number };

// get the polygon from a contours hull such that there
// will be only a single hull point for a local neighborhood
const getRoughHull = (contour: Contour, maxDist: number): number[] => {
    // get hull indices and hull points
    const hullIndices = contour.convexHullIndices();
    const contourPoints = contour.getPoints();

    const hullPointsWithIdx = hullIndices.map(idx => ({
        pt: contourPoints[idx],
        contourIdx: idx
    }) as hullPoint);

    const hullPoints = hullPointsWithIdx.map(ptWithIdx => ptWithIdx.pt);

    // group all points in local neighborhood
    const ptsBelongToSameCluster = (pt1: Point2, pt2: Point2) => ptDist(pt1, pt2) < maxDist;

    const { labels } = cv.partition(hullPoints, ptsBelongToSameCluster);
    const pointsByLabel = new Map<number, hullPoint[]>();

    labels.forEach(l => pointsByLabel.set(l, []));

    hullPointsWithIdx.forEach((ptWithIdx, i) => {
        const label = labels[i];
        pointsByLabel.get(label)?.push(ptWithIdx);
    });

    // map points in local neighborhood to most central point
    const getMostCentralPoint = (pointGroup: hullPoint[]) => {
        // find center
        const center = getCenterPt(pointGroup.map(ptWithIdx => ptWithIdx.pt));
        // sort ascending by distance to center
        return pointGroup.sort(
            (ptWithIdx1, ptWithIdx2) => ptDist(ptWithIdx1.pt, center) - ptDist(ptWithIdx2.pt, center)
        )[0];
    };

    const pointGroups = Array.from(pointsByLabel.values());
    // return contour indices of most central points
    return pointGroups.map(getMostCentralPoint).map(ptWithIdx => ptWithIdx.contourIdx).sort((a, b) => a < b ? -1 : 1);
};

type hullVertices = {
    pt: Point2;
    d1: Point2;
    d2: Point2;
} | {
    pt: Point2;
    d1: null;
    d2: null;
};

const getHullDefectVertices = (handContour: Contour, hullIndices: number[]): hullVertices[] => {
    
    // console.log(handContour, hullIndices);
    const defects = handContour.convexityDefects(hullIndices);
    
    const handContourPoints = handContour.getPoints();

    // get neighbor defect points of each hull point
    const hullPointDefectNeighbors = new Map<number, number[]>(hullIndices.map(idx => [idx, []]));

    defects.forEach((defect: Vec4) => {
        const startPointIdx = defect.at(0);
        const endPointIdx = defect.at(1);
        const defectPointIdx = defect.at(2);
        hullPointDefectNeighbors.get(startPointIdx)?.push(defectPointIdx);
        hullPointDefectNeighbors.get(endPointIdx)?.push(defectPointIdx);
    });

    return Array.from(hullPointDefectNeighbors.keys())
        // only consider hull points that have 2 neighbor defects
        .filter(hullIndex => (hullPointDefectNeighbors.get(hullIndex)?.length || 0) > 1)
        // return vertex points
        .map((hullIndex) => {
            const defectNeighborsIdx = hullPointDefectNeighbors.get(hullIndex);
            return defectNeighborsIdx? ({
                pt: handContourPoints[hullIndex],
                d1: handContourPoints[defectNeighborsIdx[0]],
                d2: handContourPoints[defectNeighborsIdx[1]]
            })
            : ({
                pt: handContourPoints[hullIndex],
                d1: null,
                d2: null
            });
        });
};

const filterVerticesByAngle = (vertices: hullVertices[], maxAngleDeg: number) =>
    vertices.filter((v) => {
        if(!v.d1)
            return false;

        const sq = (x: number) => x * x;

        const a = v.d1.sub(v.d2).norm();
        const b = v.pt.sub(v.d1).norm();
        const c = v.pt.sub(v.d2).norm();

        const angleDeg = Math.acos(((sq(b) + sq(c)) - sq(a)) / (2 * b * c)) * (180 / Math.PI);

        return angleDeg < maxAngleDeg;
    });



const blue = new cv.Vec3(255, 0, 0);
const green = new cv.Vec3(0, 255, 0);
const red = new cv.Vec3(0, 0, 255);



export function handDetection(image64: String) {
    const frame = cv.imdecode(Buffer.from(image64, 'base64'));

    const handMask = makeHandMask(frame);
    const handContour = getHandContour(handMask);

    if(!handContour)
        return;

    const maxPointDist = 25;
    const hullIndices = getRoughHull(handContour, maxPointDist);

    // get defect points of hull to contour and return vertices
    // of each hull point to its defect points
    const vertices = getHullDefectVertices(handContour, hullIndices);

    // fingertip points are those which have a sharp angle to its defect points
    const maxAngleDeg = 60;
    const verticesWithValidAngle = filterVerticesByAngle(vertices, maxAngleDeg);

    const result = frame.copy();

    const numFingersUp = verticesWithValidAngle.length;
    const fontScale = 2;

    const { rows, cols } = result;
    const sideBySide = new cv.Mat(rows, cols, cv.CV_8UC3);

    result.drawContours([handContour.getPoints()], 0, blue, 2);


    verticesWithValidAngle.forEach((v) => {
        if(v.d1) {
            frame.drawLine(
                v.pt,
                v.d1,
                { color: green, thickness: 2 }
            );
            frame.drawLine(
                v.pt,
                v.d2,
                { color: green, thickness: 2 }
            );
            frame.drawEllipse(
                new cv.RotatedRect(v.pt, new cv.Size(20, 20), 0),
                { color: red, thickness: 2 }
            );
            result.drawEllipse(
                new cv.RotatedRect(v.pt, new cv.Size(20, 20), 0),
                { color: red, thickness: 2 }
            );
        }
    });

    // display detection result

    result.drawRectangle(
        new cv.Point2(10, 10),
        new cv.Point2(70, 70),
        { color: green, thickness: 2 }
    );

    result.putText(
        String(numFingersUp),
        new cv.Point2(20, 60),
        cv.FONT_ITALIC,
        fontScale,
        { color: green, thickness: 2 }
    );

    const w = cols / 2;
    const w4 = cols / 4;

    const centerRect = new cv.Rect(w4, 0, w, rows);
    const rectSideA = frame.getRegion(centerRect);
    const rectSideB = result.getRegion(centerRect);

    rectSideA.copyTo(sideBySide.getRegion(new cv.Rect(0, 0, w, rows)));
    rectSideB.copyTo(sideBySide.getRegion(new cv.Rect(w, 0, w, rows)));

    const image = cv.imencode('.jpg', sideBySide).toString('base64');

    return image;
}