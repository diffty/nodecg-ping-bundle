var EFadeMode = {
  NOFADE: 0,
  FADEIN: 1,
  FADEOUT: 2
};

class FadingContainer extends PIXI.Container {
    constructor(x, y, contentWidget) {
        super();

        this.setContent(contentWidget);
        this.setTransform(x, y);

        this.animTime = 0;
        this.animDuration = 2;

        this.fadeMode = EFadeMode.NOFADE;
    }

    setContent(contentWidget) {
        self.contentWidget = contentWidget;
        this.addChild(self.contentWidget);
    }

    fadeIn() {
        app.ticker.add(this.update, this);
        this.animTime = 0;
        this.fadeMode = EFadeMode.FADEIN;
    }

    fadeOut() {
        app.ticker.add(this.update, this);
        this.animTime = 0;
        this.fadeMode = EFadeMode.FADEOUT;
    }

    onEndFade() {
        app.ticker.remove(this.update, this);
        this.animTime = this.animDuration;
    }

    update(delta) {
        this.animTime += app.ticker.elapsedMS / 1000.;
        let animPercent = this.animTime / this.animDuration;

        if (this.animTime > this.animDuration) {
            this.onEndFade();
        }

        if (this.fadeMode == EFadeMode.FADEIN) {
            this.alpha = animPercent;
        }
        else if (this.fadeMode == EFadeMode.FADEOUT) {
            this.alpha = 1. - animPercent;
        }
    }
}
