var ESlideMode = {
  NOSLIDE: 0,
  SLIDEIN: 1,
  SLIDEOUT: 2
};

class SlidingContainer extends PIXI.Container {
    constructor(x, y, contentWidget, dstPos, srcPos=null) {
        super();

        this.setContent(contentWidget);
        this.setTransform(x, y);

        if (srcPos) {
            this.srcPos = srcPos;
        }
        else {
            this.srcPos = this.position;
        }

        this.dstPos = dstPos;

        this.animTime = 0;
        this.animDuration = 5;

        this.slideMode = ESlideMode.NOSLIDE;
    }

    setContent(contentWidget) {
        this.contentWidget = contentWidget;
        this.addChild(this.contentWidget);
    }

    slideIn() {
        app.ticker.add(this.update, this);
        this.animTime = 0;
        this.slideMode = ESlideMode.SLIDEIN;
    }

    slideOut() {
        app.ticker.add(this.update, this);
        this.animTime = 0;
        this.slideMode = ESlideMode.SLIDEOUT;
    }

    onEndSlide() {
        app.ticker.remove(this.update, this);
        this.animTime = this.animDuration;
    }

    update(delta) {
        this.animTime += app.ticker.elapsedMS / 1000.;
        let animPercent = this.animTime / this.animDuration;

        if (this.animTime > this.animDuration) {
            this.onEndSlide();
        }

        if (this.slideMode == ESlideMode.SLIDEIN) {
            animPercent = animPercent;
        }
        else if (this.slideMode == ESlideMode.SLIDEOUT) {
            animPercent = 1. - animPercent;
        }

        this.position = new PIXI.Point(
            this.srcPos.x + animPercent * (this.dstPos.x - this.srcPos.x),
            this.srcPos.y + animPercent * (this.dstPos.y - this.srcPos.y)
        )
    }
}
