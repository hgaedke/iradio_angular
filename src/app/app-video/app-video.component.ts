import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { MediaServerAccessService } from '../shared/app-music.media-server-access.service';
import { VideoFolderContents } from './app-video.model';

@Component({
  selector: 'app-video',
  templateUrl: './app-video.component.html',
  styleUrl: './app-video.component.css'
})
export class VideoComponent implements OnInit {
  @Input({required: true}) title!: string;

  private mediaServerAccessService = inject(MediaServerAccessService);
  folderContents: VideoFolderContents = {
    files: [],
  };
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.readAndProcessFolderContents();
  }

  readAndProcessFolderContents() {
    const subscription = this.mediaServerAccessService.getVideoFolderContents()
      .subscribe((folderContents) => {
        this.folderContents = {
          files: folderContents.files,
        };
        // sort the files in reverse order, so that the newest file will be presented first
        this.folderContents.files.sort();
        this.folderContents.files.reverse();
      });

      this.destroyRef.onDestroy(() => {
        subscription.unsubscribe();
      });
  }

  /**
   * @param fileName 
   * @returns The file stream URL for fileName.
   */
  getVideoFileStreamURL(fileName: string) {
    return this.mediaServerAccessService.getVideoFileStreamURL(fileName);
  }

}