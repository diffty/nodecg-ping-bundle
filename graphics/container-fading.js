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
        this.animStartValue = -1;
        this.animEndValue = -1;
        this.animCurrValue = 0;

        this.fadeMode = EFadeMode.NOFADE;

        this.onEndFadeCallback = null;
    }

    setContent(contentWidget) {
        if (this.contentWidget != null && this.children.indexOf(this.contentWidget) >= 0) {
            this.removeChild(this.contentWidget);
        }

        this.contentWidget = contentWidget;

        if (this.contentWidget != null) {
            this.addChild(this.contentWidget);
        }
    }

    fadeIn() {
        app.ticker.add(this.update, this);
        this.animTime = 0;
        this.animStartValue = 0;
        this.animEndValue = 1.;
        this.animCurrValue = this.animStartValue;
        this.fadeMode = EFadeMode.FADEIN;
    }

    fadeOut() {
        app.ticker.add(this.update, this);
        this.animTime = 0;
        this.animStartValue = 1.;
        this.animEndValue = 0.;
        this.animCurrValue = this.animStartValue;
        this.fadeMode = EFadeMode.FADEOUT;
    }

    onEndFade() {
        app.ticker.remove(this.update, this);
        this.animTime = this.animDuration;
        if (this.onEndFadeCallback != null) {
            this.onEndFadeCallback();
        }
    }

    update(delta) {
        this.animTime += app.ticker.elapsedMS / 1000.;
        //this.animCurrValue = this.animTime / this.animDuration;
        this.animCurrValue = this.animStartValue + (this.animEndValue - this.animStartValue) * (this.animTime / this.animDuration);

        if (this.animTime > this.animDuration) {
            this.onEndFade();
        }

        if (this.fadeMode == EFadeMode.FADEIN) {
            this.alpha = this.animCurrValue;
        }
        else if (this.fadeMode == EFadeMode.FADEOUT) {
            this.alpha = this.animCurrValue;
        }
    }
}
