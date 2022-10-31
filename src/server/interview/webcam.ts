// TODO : Amika & Farouk

import { Socket } from 'socket.io';
import server, { io } from '../server';


import {processFrame} from "../dev/common";

//retrieve webcam frame from frontend
io.on("connection", (socket: Socket) => {
    socket.on("uploadWebcamStream", async (data: { stream: string }) => {        
        const currentDominantEmotionObj = await processFrame(data.stream);
        // {
        //   '1667207597822': {
        //     dominantEmotion: 'neutral',
        //     dominantEmotionPerc: 0.8099568486213684
        //   }
        // }
        console.log(currentDominantEmotionObj);
        //save in session
        //@DORIAN

    });
});



