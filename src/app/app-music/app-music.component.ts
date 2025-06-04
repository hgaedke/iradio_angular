import { afterRender, Component, computed, DestroyRef, effect, ElementRef, inject, Input, signal, ViewChild } from '@angular/core';
import { FolderContents, ViewMode } from './app-music.model';
import { MediaServerAccessService } from './app-music.media-server-access.service';

@Component({
  selector: 'app-music',
  imports: [],
  templateUrl: './app-music.component.html',
  styleUrl: './app-music.component.css',
})
export class MusicComponent {
  @Input({required: true}) title!: string;

  private FIRST_BACKGROUND_COLOR: string = '#FFC0C0';
  private SECOND_BACKGROUND_COLOR: string = '#C0C0FF';

  ViewMode = ViewMode; // necessary to access ViewMode from template

  private mediaServerAccessService = inject(MediaServerAccessService);
  private destroyRef = inject(DestroyRef);

  private relativeDirectory = signal<string>('.'); // change of relativeDirectory triggers updates of remaining properties once HTTP request is done
  folderContents: FolderContents = {
    directories: [],
    files: [],
  };
  viewMode: ViewMode = ViewMode.VIEW_MODE_FOLDER;
  showBackButton: boolean = false;

  private enableAutoStart = false; // used to defer the music autostart until after the next render

  @ViewChild('audioElement') audioElement!: ElementRef; // uses the HTMLAudioElement declared in the HTML template for playback

  /**
   * Makes sure that the page is updated when the HTTP request for folderContents is complete.
   */
  constructor() {
    effect(() => {
      // (Done like this and not via computed(), because asynchronous HTTP request is involved.)
      this.readAndProcessFolderContents();
    });

    afterRender(() => {
      // Cannot directly call onSelectPlayableFile from updateViewMode, because the element reference
      // to the audio element is not yet ready at that time.
      if (this.enableAutoStart) {
        this.enableAutoStart = false;
        this.onSelectPlayableFile(this.folderContents.files[0]);
      }
    });
  }

  /**
   * Gets the folder contents of this.relativeDirectory by sending a HTTP get request.
   * Then, sets the viewMode depending on the results.
   */
  readAndProcessFolderContents() {
    const subscription = this.mediaServerAccessService.getFolderContents(this.relativeDirectory())
    .subscribe((folderContents) => {
      this.folderContents = {
        directories : folderContents.directories,
        files: folderContents.files,
      };
      this.updateViewMode();
      this.updateBackButtonVisibility();
    });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  /**
   * @param folderContents
   * @returns The viewMode, derived from the given folderContents:
   *          If there is at least 1 directory, view mode is VIEW_MODE_FOLDER,
   *          VIEW_MODE_PLAYBACK otherwise.
   */
  computeViewMode(folderContents: FolderContents): ViewMode {
    if (folderContents.directories.length > 0) {
      return ViewMode.VIEW_MODE_FOLDER;
    } else {
      return ViewMode.VIEW_MODE_PLAYBACK;
    }
  }

  /**
   * Sets the viewMode, depending on this.directories:
   * If there is at least 1 directory, set view mode
   * to folder; playback view mode otherwise.
   */
  updateViewMode() {
    this.viewMode = this.computeViewMode(this.folderContents);

    // autostart playback on enter playback mode
    if (this.viewMode === ViewMode.VIEW_MODE_PLAYBACK && this.folderContents.files.length > 0) {
      // Via enableAutoStart we delay the autostart until after the next render to make
      // sure that the audio element reference is accessible on the onSelectPlayableFile call.
      this.enableAutoStart = true;
    }
  }

  /**
   * Sets the back button visibility, depending on the view mode:
   * In folder view mode, show the back button for all folders except ".".
   * In playback view mode, always show the back button.
   */
  updateBackButtonVisibility() {
    if (this.computeViewMode(this.folderContents) === ViewMode.VIEW_MODE_FOLDER) {
      if (this.relativeDirectory() === '.') {
        this.showBackButton = false;
      } else {
        this.showBackButton = true;
      }
    } else {
      this.showBackButton = true;
    }
  }

  /**
   * @param firstColor
   * @returns this.FIRST_BACKGROUND_COLOR if firstColor is true; this.SECOND_BACKGROUND_COLOR otherwise.
   */
  getBackgroundColor(firstColor: boolean): string {
    if (firstColor) {
      return this.FIRST_BACKGROUND_COLOR;
    } else {
      return this.SECOND_BACKGROUND_COLOR;
    }
  }

  /**
   * Enters subdir, i.e. shows the contents of that subdirectory.
   * 
   * @param subdir 
   */
  onSelectSubdirectory(subdir: string) {
    this.relativeDirectory.set(this.relativeDirectory() + '/' + subdir);
  }

  /**
   * Stops the current audio playback.
   */
  stopPlayback() {
    this.audioElement?.nativeElement.pause(); // ? in case this function was called in folder view mode
  }

  /**
   * Starts the playback of the file given via fileName.
   * 
   * @param fileName 
   */
  onSelectPlayableFile(fileName: string) {
    this.stopPlayback();
    
    this.audioElement.nativeElement.src = this.mediaServerAccessService.getFileStreamURL(this.relativeDirectory() + '/' + fileName);
    this.audioElement.nativeElement.load();
    this.audioElement.nativeElement.play();

    this.destroyRef.onDestroy(() => {
      this.stopPlayback();
    });
  }

  /**
   * Goes back to the parent directory.
   */
  onClickBackButton() {
    const indexSlash = this.relativeDirectory().lastIndexOf('/');
    if (indexSlash < 0 || indexSlash >= this.relativeDirectory().length) {
      console.log('malformed relativeDirectory (no / found): ' + this.relativeDirectory());
      return;
    }
    
    this.stopPlayback();

    this.relativeDirectory.set(this.relativeDirectory().substring(0, indexSlash));
  }
}
