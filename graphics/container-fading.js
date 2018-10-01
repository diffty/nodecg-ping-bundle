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

        this.onEndFadeInCallback = null;
        this.onEndFadeOutCallback = null;
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
        app.ticker.remove(this.update, this);
        app.ticker.add(this.update, this);
        this.animStartValue = 0;
        this.animEndValue = 1.;
        this.fadeMode = EFadeMode.FADEIN;
    }

    fadeOut() {
        app.ticker.remove(this.update, this);
        app.ticker.add(this.update, this);
        this.animStartValue = 0.;
        this.animEndValue = 1.;
        this.fadeMode = EFadeMode.FADEOUT;
    }

    onEndFade() {
        app.ticker.remove(this.update, this);

        if (this.fadeMode == EFadeMode.FADEIN) {
            this.animTime = this.animDuration;
        }
        else {
            this.animTime = 0;
        }

        if (this.fadeMode == EFadeMode.FADEIN && this.onEndFadeInCallback != null) {
            this.onEndFadeInCallback();
        }
        if (this.fadeMode == EFadeMode.FADEOUT && this.onEndFadeOutCallback != null) {
            this.onEndFadeOutCallback();
        }
    }

    update(delta) {
        if (this.fadeMode == EFadeMode.FADEIN) {
            this.animTime += app.ticker.elapsedMS / 1000.;
        }
        else {
            this.animTime -= app.ticker.elapsedMS / 1000.;   
        }

        //this.animCurrValue = this.animTime / this.animDuration;
        this.animCurrValue = this.animStartValue + (this.animEndValue - this.animStartValue) * (this.animTime / this.animDuration);

        if (    (this.animTime > this.animDuration && this.fadeMode == EFadeMode.FADEIN) 
             || (this.animTime < 0                 && this.fadeMode == EFadeMode.FADEOUT)) {
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
