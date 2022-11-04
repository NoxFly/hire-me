export type Emotion = 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised';

export type EmotionMap = {
    [key in Emotion]: number
};

export interface EmotionPerc {
    emotion: Emotion | undefined,
    perc: number
}

export function emptyEmotionMap(): EmotionMap {
    return {
        neutral: 0,
        happy: 0,
        sad: 0,
        angry: 0,
        fearful: 0,
        disgusted: 0,
        surprised: 0
    } as EmotionMap;
}