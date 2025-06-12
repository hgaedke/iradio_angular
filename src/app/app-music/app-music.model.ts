export type MusicFolderContents = {
    directories: string[],
    files: string[],
};

export enum ViewMode {
    VIEW_MODE_FOLDER,
    VIEW_MODE_PLAYBACK,
};