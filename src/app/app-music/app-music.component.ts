import { afterRender, ChangeDetectorRef, Component, computed, DestroyRef, effect, ElementRef, inject, Input, signal, ViewChild } from '@angular/core';
import { MusicFolderContents, ViewMode } from './app-music.model';
import { MediaServerAccessService } from '../shared/app-music.media-server-access.service';

// Workaround: found no other possibility to access the musicComponent inside playNextFile().
let musicComponent: MusicComponent | undefined = undefined;

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
  private changeDetectorRef = inject(ChangeDetectorRef); // Workaround: needed for manual re-render after altering
                                                         // currentSongName in onSelectPlayableFile()

  private relativeDirectory = signal<string>('.'); // change of relativeDirectory triggers updates of remaining properties once HTTP request is done
  folderContents: MusicFolderContents = {
    directories: [],
    files: [],
  };
  viewMode: ViewMode = ViewMode.VIEW_MODE_FOLDER;
  showBackButton: boolean = false;
  albumName: string = '';

  private enableAutoStart = false; // used to defer the music autostart until after the next render

  private selectedDirectoriesStack: string[] = []; // ["bla1",  "bla2",  "bla3"]
                                                   //  (level0) (level1) (level2)
  private enterAction: 'FORWARD' | 'BACK' | undefined = undefined; // 'FORWARD': enter subdirectory; 'BACK': leave subdirectory
  private enterActionDeferred: 'FORWARD' | 'BACK' | undefined = 'FORWARD'; // Defer the enterAction, because we need to wait
                                                                           // for the data before we can scroll.
                                                                           // Initially set to 'FORWARD' because initially
                                                                           // in the top directory we scroll to position 0.

  private currentSongName: string = 'undefined'; // currently played song name

  @ViewChild('audioElement') audioElement!: ElementRef; // uses the HTMLAudioElement declared in the HTML template for playback

  /**
   * Makes sure that the page is updated when the HTTP request for folderContents is complete.
   */
  constructor() {
    musicComponent = this;

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

      if (this.enterAction) {
        // Defer the enterAction, because we need to wait for the data before we can scroll.
        // This here is executed only after the data is available.
        if (this.enterAction === 'FORWARD') {
          this.updateScrollPosition(0);
        } else if (this.enterAction === 'BACK') {
          const selectedRowName = this.selectedDirectoriesStack.pop();
          if (selectedRowName) {
            this.updateScrollPosition(this.getIndex(selectedRowName, this.folderContents.directories));
          }
        }
        this.enterAction = undefined;
      }
    });

    this.destroyRef.onDestroy(() => {
      this.stopPlayback();
    });
  }

  /**
   * Gets the folder contents of this.relativeDirectory by sending a HTTP get request.
   * Then, sets the viewMode depending on the results.
   */
  readAndProcessFolderContents() {
    const subscription = this.mediaServerAccessService.getMusicFolderContents(this.relativeDirectory())
    .subscribe((folderContents) => {
      this.folderContents = {
        directories : folderContents.directories,
        files: folderContents.files,
      };
      this.updateViewMode();
      this.updateBackButtonVisibility();
      this.updateAlbumName();
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
  computeViewMode(folderContents: MusicFolderContents): ViewMode {
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

    if (this.folderContents.files.length > 0 || this.folderContents.directories.length > 0) {
      // Data is available now => execute the deferred action.
      if (this.enterActionDeferred) {
        this.enterAction = this.enterActionDeferred;
        this.enterActionDeferred = undefined;
      }
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
   * Updates this.albumName according to the last selected subdirectory.
   */
  updateAlbumName() {
    const indexSlash = this.relativeDirectory().lastIndexOf('/');
    if (indexSlash < 0 || indexSlash >= this.relativeDirectory().length) {
      this.albumName = '';
    } else {
      this.albumName = this.relativeDirectory().substring(indexSlash + 1, this.relativeDirectory().length);
    }
  }

  /**
   * Scrolls the list container so that the entry with the given row number (targetRowNumber) is
   * centered inside the list container.
   * 
   * @param targetRowNumber
   */
  updateScrollPosition(targetRowNumber: number) {
    let listDiv = document.getElementById('list')!;
    const firstRowDiv = document.getElementById(this.getRowId(0))!;
    const targetRow = document.getElementById(this.getRowId(targetRowNumber))!;
    
    // absolute y pos of first row
    const y0 = firstRowDiv.offsetTop;
    
    // relative y pos of current row
    let yTargetRel = targetRow.offsetTop - y0;

    // subtract half of the shown list div height to _center_ the target row (instead having it at the top)
    yTargetRel -= listDiv.clientHeight / 2;

    // scroll to the center of the row, not the top of it
    yTargetRel += targetRow.clientHeight / 2;

    // scroll
    listDiv.scrollTop = yTargetRel;
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
   * @param rowNumber 
   * @returns An ID computed from rowNumber.
   */
  getRowId(rowNumber: number) {
    return 'row_id_' + String(rowNumber);
  }

  /**
   * Enters subdir, i.e. shows the contents of that subdirectory.
   * 
   * @param subdir 
   */
  onSelectSubdirectory(subdir: string) {
    this.relativeDirectory.set(this.relativeDirectory() + '/' + subdir);

    this.enterAction = 'FORWARD';
    this.selectedDirectoriesStack.push(subdir);
  }

  /**
   * Stops the current audio playback.
   */
  stopPlayback() {
    this.audioElement?.nativeElement.pause(); // ? in case this function was called in folder view mode
    this.audioElement?.nativeElement.removeEventListener('ended', this.playNextFile);
  }

  /**
   * Starts the playback of the file given via fileName.
   * 
   * @param fileName 
   */
  onSelectPlayableFile(fileName: string) {
    this.stopPlayback();
    
    this.audioElement.nativeElement.src = this.mediaServerAccessService.getMusicFileStreamURL(this.relativeDirectory() + '/' + fileName);
    this.audioElement.nativeElement.load();
    this.audioElement.nativeElement.play();

    this.updateScrollPosition(this.getIndex(fileName, this.folderContents.files));

    this.currentSongName = fileName;
    // Need to trigger rendering manually, because a change of currentSongName does not
    // always automatically trigger re-render :-(
    this.changeDetectorRef.detectChanges();

    // make sure that the next song is played once the current song ends
    this.audioElement?.nativeElement.addEventListener('ended', this.playNextFile);
  }

  /**
   * Executed if a file has been played until its end.
   * Starts playing the next file in the list.
   */
  playNextFile() {
    const indexOfCurrentSong = musicComponent!.getIndex(musicComponent!.currentSongName, musicComponent!.folderContents.files);
    const indexOfNextSong = (indexOfCurrentSong + 1) % musicComponent!.folderContents.files.length;
    const nextSong = musicComponent!.folderContents.files[indexOfNextSong];
    musicComponent!.onSelectPlayableFile(nextSong);
  }

  /**
   * @param containedElement 
   * @param container 
   * @returns The index of containedElement in container; -1 if containedElement is not contained in container.
   */
  getIndex(containedElement: string, container: string[]) {
    return container.findIndex((elem) => elem === containedElement);
  }

  /**
   * @param fileName 
   * @returns 'bold' if fileName is the currentSongName; 'normal' otherwise.
   */
  getFontWeight(fileName: string) {
    if (fileName === this.currentSongName) {
      return 'bold';
    } else {
      return 'normal';
    }
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
    this.enterActionDeferred = 'BACK';
  }

  getContainerGridTemplateAreas() {
    if (this.albumName === '') {
      return '"header" "list" "footer"';
    } else {
      return '"header" "album" "list" "footer"';
    }
  }

  getContainerGridTemplateRows() {
    if (this.albumName === '') {
      return '3.5em auto 3.5em';
    } else {
      return '3.5em 3.5em auto 3.5em';
    }
  }
}
