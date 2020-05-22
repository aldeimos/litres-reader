/// <reference path="FinishWindowHead.ts" />

module Finish {
	export class FinishWindow implements IFinishWindow {
		private ShowState: boolean;
		constructor (public Obj: HTMLElement,
								 public Parent: EventsModule.IEventActions) {
			this.ShowState = false;
			this.AddHandlers();
		}
		public AddHandlers() {
			this.Obj.addEventListener('click', (e) => {
				if(e.target == this.Obj) {
					this.HideWindow();
					TopMenuObj.RemoveActive();					
				}
			}, false);

			this.Obj.querySelector(".finish-icon-close").addEventListener("click", (e) => {
				this.HideWindow();
				TopMenuObj.RemoveActive();					
			})
		}
		public ButtonHandler(): void {
			if (!this.ShowState) {
				this.ShowWindow();
			} else {
				this.HideWindow();
			}
		}
		public ShowWindow(): void {
			
			var TrialButton = <HTMLElement> document.querySelector('.finish-buy-button');
			TrialButton.innerHTML = this.ShowTrialEnd("finish-button");
			if(TrialButton.innerHTML == "") {
				return
			}

			this.ShowState = true;
			this.ToggleWindow('block');
			this.Parent.ZoomObj.ZoomAnything(this.Obj);
			addTrialHandlers(<HTMLElement> TrialButton.querySelector('.trial-button'))

			var fileIdNumbers = LitresURLParser.FileID.split("");
			while(fileIdNumbers.length > 8) {
				fileIdNumbers.shift();
			}

			if(fileIdNumbers.length >= 7) {
				var orHost = aldebaran_or4 ? '//be2.aldebaran.ru' : '//www.litres.ru';

				
				changeCSS(".finish-cover-block", "background", "url("+orHost+"/static/bookimages/" + fileIdNumbers[0] + fileIdNumbers[1] + "/" +
					fileIdNumbers[2] + fileIdNumbers[3] + "/" + fileIdNumbers[4] + fileIdNumbers[5] + "/" + LitresURLParser.FileID + ".bin.dir/" + 
					LitresURLParser.FileID + ".cover_415.jpg) no-repeat center;")
				changeCSS(".finish-cover-block", "background-size", "contain");
			}			
		}


		private ShowTrialEnd(ID: string): string {
			if (LitresURLParser.PartID == 458582) {
				return '';
			}
			var trialBlockClass = '';
			if(!LitresURLParser.Trial) {
				return ''
			}
			var newWindow = LitresURLParser.Iframe ? 'target="_blank"':'';
	
			return '<div id="' + ID + '"' + trialBlockClass + ' style="margin-top:9px;">' +
					'<a id="' + ID + '_1_2" href="" class="litreslink noload trial-button" '+newWindow+'>' + textTrialButton() + '</a>' +
				'</div>';
		}
		public HideWindow(): void {
			this.ToggleWindow('none');
			this.ShowState = false;
		}
		private ToggleWindow(state: string) {
			changeCSS(".finish-buy-box", "display", state)
		}
	}
}