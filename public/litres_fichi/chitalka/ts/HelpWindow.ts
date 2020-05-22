/// <reference path="HelpWindowHead.ts" />

module Help {
	export class HelpWindow implements IHelpWindow {
		private ShowState: boolean;
		private ButtonClass: string[] = ['menu-help'];
		constructor (public Obj: HTMLElement, public Parent: EventsModule.IEventActions, public UILangData: Object) {
			this.ShowState = false;
			this.AddHandlers();
			this.Parent.WindowsCarry.RegisterWindow(this);
		}
		public AddHandlers() {
			this.Obj.addEventListener('click', () => {
				this.HideWindow();
				TopMenuObj.RemoveActive();
			}, false);
		}
		public ButtonHandler(): void {
			if (!this.ShowState) {
				this.ShowWindow();
			} else {
				this.HideWindow();
			}
		}
		public ShowWindow(): void {
			var lang = (this.UILangData && this.UILangData['lang']) || 'ru',
				imagePath = `images/uilang/${lang}/help-window.png`;

			this.ShowState = true;
			this.Parent.Mask.Show('0.8');
			this.ToggleWindow('block');
			this.Obj.style.background = `url('${imagePath}') center center no-repeat`;
			this.Parent.ZoomObj.ZoomAnything(this.Obj);
		}
		public HideWindow(): void {
			this.Parent.Mask.Hide();
			this.ToggleWindow('none');
			this.ShowState = false;
		}
		private ToggleWindow(state: string) {
			this.Obj.style.display = state;
		}
	}
}