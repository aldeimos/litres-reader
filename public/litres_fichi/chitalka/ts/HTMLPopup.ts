/// <reference path="HTMLPopupHead.ts" />

module HTMLPopup {
    export class HTMLPopup implements IHTMLPopup {
        public Hidden: boolean;

        private El: HTMLElement;
        private ReaderEl: HTMLElement;
        private ButtonClass: string[] = [];

        constructor(private Owner: EventsModule.IEventActions) {
            this.Hidden = true;
            this.ReaderEl = <HTMLElement> doc.querySelector('#reader');
            this.El = <HTMLElement> document.querySelector('#popup');
            this.Owner.WindowsCarry.RegisterWindow(this);
        }

        public Show(target, contents) {
            this.Owner.WindowsCarry.HideAllWindows(true);
            this.Owner.Mask.Show('0');
            this.El.querySelector('.popup-contents').innerHTML = contents;
            this.El.style.display = 'block';
            this.Reposition(target);
            this.Hidden = false;
        }

        public Hide() {
            this.El.style.display = 'none';
            this.Hidden = true;
        }

        public HideWindow() {
            this.Hide();
        }

        private Reposition(target) {
            if (target) {
                var rect = target.getBoundingClientRect(),
                    mainRect = this.ReaderEl.getBoundingClientRect();
                   
                var left = rect.left,
                    top  = rect.top;

                this.El.style.left = left + target.offsetWidth / 2 - this.El.offsetWidth / 2 + 'px';
                // TODO: Dynamically apply half of triangle width
                this.El.style.top = top + target.offsetHeight + 6 + 'px'
            }
        }
    }
}