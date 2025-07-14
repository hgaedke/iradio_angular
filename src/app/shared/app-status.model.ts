import { AllowedApps } from "./app-common-types.model";

export type AppStatus = {
  app: AllowedApps | undefined;
  radio1_station: number | undefined;
  radio2_station: number | undefined;
  music: MusicStatus | undefined;
  video: VideoStatus | undefined;
}

export type MusicStatus = {
  viewMode: "VIEW_MODE_FOLDER" | "VIEW_MODE_PLAYBACK" | undefined;
  albumName: string | undefined;
  currentSongName: string | undefined;
}

export type VideoStatus = {
}