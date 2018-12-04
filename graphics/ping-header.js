var EHeaderInfo_Type = {

}

var EHeaderInfoAlign = {
    LEFT: 0,
    CENTER: 1,
    RIGHT: 2,
}

class HeaderInfo {
    constructor(name, contentLeft, contentRight, duration, contentLeftAlign = EHeaderInfoAlign.LEFT, contentRightAlign = EHeaderInfoAlign.LEFT) {
        this.name = name;
        this.duration = duration;
        this.contentLeft = contentLeft;
        this.contentRight = contentRight;
        this.contentLeftAlign = contentLeftAlign;
        this.contentRightAlign = contentRightAlign;
    }
}

var ALERT_SYMBOL_COLOR = 0x000000;     // 0x304895;  //3E070F
var ALERT_TEXT_COLOR = 0x000000;     // 0x304895;
var ALERT_DURATION = 3;
var MARGIN = 15


class HeaderPanelContainer extends FadingContainer {
    constructor(x, y, width, height, contentWidget, margin=0, isAlert=false) {
        super(x, y, contentWidget);

        this.animDuration = 0.5;

        this.margin = margin;
        this.isAlert = isAlert;

        this.bounds = new PIXI.Rectangle(0, 0, width, height);

        this.bg = new PIXI.Graphics().beginFill(ALERT_TEXT_COLOR, 1);
        this.bg.drawRect(0, 0, this.bounds.width, this.bounds.height);
        this.bg.endFill();

        if (this.isAlert) {
            this.addChild(this.bg);
            this.alpha = 0;
        }

        this.mask = new PIXI.Graphics();
        this.addChild(this.mask);
        this.updateMask();

        this.setTransform(x, y);
    }

    updateMask() {
        this.mask.clear();
        this.mask.drawRect(0, 0, this.bounds.width, this.bounds.height);
    }
}


class StatusContainer extends FadingContainer {
    constructor(x, y, contentWidget, contentOffsetX=0, contentOffsetY=0, isAlert=false) {
        super(x, y, contentWidget);

        this.animDuration = 0.5;

        this.isAlert = isAlert;

        if (isAlert) {
            var bgColor = ALERT_SYMBOL_COLOR;
            this.alpha = 0;
        }
        else {
            var bgColor = 0x000000;
        }

        this.bg = new PIXI.Graphics().beginFill(bgColor, 1);
        this.bg.drawPolygon([
            new PIXI.Point(0, 0),
            new PIXI.Point(288, 0),
            new PIXI.Point(288, 100),
            new PIXI.Point(144, 151),
            new PIXI.Point(0, 100),
            new PIXI.Point(0, 0),
        ])

        this.bg.endFill();

        contentWidget.x += contentOffsetX;
        contentWidget.y += contentOffsetY;

        this.addChildAt(this.bg, 0);
    }
}


class PingHeader extends PIXI.Container {
    constructor() {
        super();

        this.infoList = [];
        this.alertList = [];

        this.currHeaderInfo = null;
        this.currHeaderInfoId = 0;

        this.currHeaderAlert = null;

        this.leftContainerInfo = new HeaderPanelContainer(0, 0, 727, 69, null, MARGIN);
        this.rightContainerInfo = new HeaderPanelContainer(885, 0, 395, 69, null, MARGIN);

        this.leftContainerAlert = new HeaderPanelContainer(0, 0, 727, 69, null, MARGIN, true);
        this.rightContainerAlert = new HeaderPanelContainer(885, 0, 395, 69, null, MARGIN, true);

        var idleVideo = document.createElement("video");
        idleVideo.preload = "auto";
        idleVideo.loop = true;              // enable looping
        //idleVideo.src = "media/LIVENOWPING.webm";
        idleVideo.src = "media/panta_icone.webm";

        var alertVideo = document.createElement("video");
        alertVideo.preload = "auto";
        alertVideo.loop = true;              // enable looping
        //alertVideo.src = "media/ALERT.webm";
        alertVideo.src = "media/excla_icone.webm";

        var idleVideoTex = PIXI.Texture.fromVideo(idleVideo);
        var idleVideoSprite = new PIXI.Sprite(idleVideoTex);

        var alertVideoTex = PIXI.Texture.fromVideo(alertVideo);
        var alertVideoSprite = new PIXI.Sprite(alertVideoTex);

        this.statusContainerIdle = new StatusContainer(667, -10, idleVideoSprite, 60);                    // 659
        this.statusContainerAlert = new StatusContainer(667, -10, alertVideoSprite, 60, 0, true);         // 659

        this.currHeaderInfoTime = 0.0;
        this.currHeaderAlertTime = -1.0;

        this.addChild(this.leftContainerInfo);
        this.addChild(this.rightContainerInfo);

        this.addChild(this.leftContainerAlert);
        this.addChild(this.rightContainerAlert);

        this.addChild(this.statusContainerIdle);
        this.addChild(this.statusContainerAlert);

        app.ticker.add(this.update, this);
    }

    update(delta) {
        if (this.currHeaderInfo) {
            if (this.currHeaderInfoTime != -1) {
                this.currHeaderInfoTime += app.ticker.elapsedMS / 1000.;
            }

            if (this.currHeaderInfoTime > this.currHeaderInfo.duration) {
                this.currHeaderInfoTime = -1;
                this.leftContainerInfo.onEndFadeOutCallback = () => this.setHeaderInfoNext();
                this.rightContainerInfo.onEndFadeOutCallback = () => this.setHeaderInfoNext();
                this.leftContainerInfo.fadeOut();
                this.rightContainerInfo.fadeOut();
            }
        }

        if (this.currHeaderAlert && this.currHeaderAlertTime != -1) {
            this.currHeaderAlertTime += app.ticker.elapsedMS / 1000.;

            if (this.currHeaderAlertTime > this.currHeaderAlert.duration) {
                this.currHeaderAlertTime = -1;
                this.setHeaderAlertNext();
            }
        }
    }

    addInfo(infoObj) {
        if (infoObj.contentLeftAlign == EHeaderInfoAlign.RIGHT) {
            infoObj.contentLeft.setTransform(
                infoObj.contentLeft.x + this.leftContainerInfo.bounds.width - infoObj.contentLeft.width - MARGIN,
                infoObj.contentLeft.y + MARGIN
            );
        }
        else {
            infoObj.contentLeft.setTransform(
                infoObj.contentLeft.x + MARGIN,
                infoObj.contentLeft.y + MARGIN
            );
        }

        if (infoObj.contentRightAlign == EHeaderInfoAlign.RIGHT) {
            infoObj.contentRight.setTransform(
                infoObj.contentRight.x + this.rightContainerInfo.bounds.width - infoObj.contentRight.width - MARGIN,
                infoObj.contentRight.y + MARGIN
            );
        }
        else {
            infoObj.contentRight.setTransform(
                infoObj.contentRight.x + MARGIN,
                infoObj.contentRight.y + MARGIN
            );
        }

        this.infoList.push(infoObj);
        if (this.infoList.length == 1) {
            this.setHeaderInfoById(0);
        }
    }

    addAlert(alertObj) {
        if (alertObj.contentLeftAlign == EHeaderInfoAlign.RIGHT) {
            alertObj.contentLeft.setTransform(
                alertObj.contentLeft.x + this.leftContainerAlert.bounds.width - alertObj.contentLeft.width - MARGIN,
                alertObj.contentLeft.y + MARGIN
            );
        }
        else {
            alertObj.contentLeft.setTransform(
                alertObj.contentLeft.x + MARGIN,
                alertObj.contentLeft.y + MARGIN
            );
        }

        if (alertObj.contentRightAlign == EHeaderInfoAlign.RIGHT) {
            alertObj.contentRight.setTransform(
                alertObj.contentRight.x + this.rightContainerAlert.bounds.width - alertObj.contentRight.width - MARGIN,
                alertObj.contentRight.y + MARGIN
            );
        }
        else {
            alertObj.contentRight.setTransform(
                alertObj.contentRight.x + MARGIN,
                alertObj.contentRight.y + MARGIN
            );
        }

        this.alertList.push(alertObj);
        if (this.alertList.length == 1) {
            this.setHeaderAlertById(0);
        }
    }

    startInfoStayTimer() {
        this.currHeaderInfoTime = 0;
    }

    startAlertStayTimer() {
        this.currHeaderAlertTime = 0;
    }

    setHeaderInfoById(id) {
        var currHeaderInfo = this.infoList[id];
        this.setHeaderInfo(currHeaderInfo);
    }

    setHeaderAlertById(id) {
        var currHeaderAlert = this.alertList[id];
        this.setHeaderAlert(currHeaderAlert);
    }

    setHeaderInfoNext() {
        this.currHeaderInfoId = (this.currHeaderInfoId + 1) % this.infoList.length;
        this.setHeaderInfoById(this.currHeaderInfoId);
        
        this.leftContainerInfo.onEndFadeInCallback = () => this.startInfoStayTimer();
        this.rightContainerInfo.onEndFadeInCallback = () => this.startInfoStayTimer();
        
        this.leftContainerInfo.fadeIn();
        this.rightContainerInfo.fadeIn();
    }

    setHeaderAlertNext() {
        this.alertList.shift();

        if (this.alertList.length > 0) {
            this.currHeaderAlertId = 0;
            this.setHeaderAlertById(this.currHeaderAlertId);
        }
        else {
            //this.leftContainerAlert.removeChild(this.currHeaderAlert.contentLeft);
            //this.rightContainerAlert.removeChild(this.currHeaderAlert.contentRight);

            this.leftContainerAlert.fadeOut();
            this.rightContainerAlert.fadeOut();

            this.statusContainerAlert.fadeOut();
        }
    }

    setHeaderInfo(headerInfoObj) {
        /*if (this.currHeaderInfo != null) {
            this.leftContainerInfo.removeChild(this.currHeaderInfo.contentLeft);
            this.rightContainerInfo.removeChild(this.currHeaderInfo.contentRight);
        }*/

        this.currHeaderInfo = headerInfoObj;

        this.leftContainerInfo.setContent(this.currHeaderInfo.contentLeft);
        this.rightContainerInfo.setContent(this.currHeaderInfo.contentRight);
    }

    setHeaderAlert(headerAlertObj) {
        /*if (this.currHeaderAlert != null) {
            this.leftContainerAlert.removeChild(this.currHeaderAlert.contentLeft);
            this.rightContainerAlert.removeChild(this.currHeaderAlert.contentRight);
        }*/

        this.currHeaderAlert = headerAlertObj;

        this.leftContainerAlert.setContent(this.currHeaderAlert.contentLeft);
        this.rightContainerAlert.setContent(this.currHeaderAlert.contentRight);

        this.leftContainerAlert.onEndFadeInCallback = () => this.startAlertStayTimer();
        this.rightContainerAlert.onEndFadeInCallback = () => this.startAlertStayTimer();

        this.leftContainerAlert.fadeIn();
        this.rightContainerAlert.fadeIn();

        this.statusContainerAlert.fadeIn();
    }

    createAlert(title, content) {
        var alertTitleWidget = new PIXI.Text(
            title,
            TEXT_ALERT_STYLE,
        );

        var alertContentWidget = new PIXI.Text(
            content,
            TEXT_ALERT_STYLE,
        );

        glow_effect = new PIXI.filters.GlowFilter(15, 5, 0, GLOW_ALERT_COLOR, 0.5)

        alertTitleWidget.filters = [glow_effect]
        alertContentWidget.filters = [glow_effect]

        var headerAlertObj = new HeaderInfo(
            "Alerte_" + title,
            alertTitleWidget,
            alertContentWidget,
            ALERT_DURATION,
            EHeaderInfoAlign.LEFT, EHeaderInfoAlign.RIGHT);

        this.addAlert(headerAlertObj);
    }
}
