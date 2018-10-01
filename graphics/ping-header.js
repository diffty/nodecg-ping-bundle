var EHeaderInfo_Type = {

}

var EHeaderInfoAlign = {
    LEFT: 0,
    CENTER: 1,
    RIGHT: 2,
}

class HeaderInfo {
    constructor(name, contentLeft, contentRight, duration, align = EHeaderInfoAlign.LEFT) {
        this.name = name;
        this.duration = duration;
        this.contentLeft = contentLeft;
        this.contentRight = contentRight;
        this.align = EHeaderInfoAlign.LEFT;
    }
}

var ALERT_COLOR = 0x304895;
var ALERT_DURATION = 3;

class HeaderPanelContainer extends FadingContainer {
    constructor(x, y, width, height, contentWidget, isAlert) {
        super(x, y, contentWidget);

        this.animDuration = 0.5;

        this.isAlert = isAlert;

        this.bounds = new PIXI.Rectangle(0, 0, width, height);

        this.bg = new PIXI.Graphics().beginFill(ALERT_COLOR, 1);
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


class PingHeader extends PIXI.Container {
    constructor() {
        super();

        this.infoList = [];
        this.alertList = [];

        this.currHeaderInfo = null;
        this.currHeaderInfoId = 0;

        this.currHeaderAlert = null;

        this.leftContainerInfo = new HeaderPanelContainer(0, 0, 727, 69);
        this.rightContainerInfo = new HeaderPanelContainer(885, 0, 395, 69);

        this.leftContainerAlert = new HeaderPanelContainer(0, 0, 727, 69, null, true);
        this.rightContainerAlert = new HeaderPanelContainer(885, 0, 395, 69, null, true);

        this.currHeaderInfoTime = 0.0;
        this.currHeaderAlertTime = -1.0;

        this.addChild(this.leftContainerInfo);
        this.addChild(this.rightContainerInfo);

        this.addChild(this.leftContainerAlert);
        this.addChild(this.rightContainerAlert);

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
        this.infoList.push(infoObj);
        if (this.infoList.length == 1) {
            this.setHeaderInfoById(0);
        }
    }

    addAlert(alertObj) {
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
        }
    }

    setHeaderInfo(headerInfoObj) {
        if (this.currHeaderInfo != null) {
            this.leftContainerInfo.removeChild(this.currHeaderInfo.contentLeft);
            this.rightContainerInfo.removeChild(this.currHeaderInfo.contentRight);
        }

        this.currHeaderInfo = headerInfoObj;

        this.leftContainerInfo.addChild(this.currHeaderInfo.contentLeft);
        this.rightContainerInfo.addChild(this.currHeaderInfo.contentRight);
    }

    setHeaderAlert(headerAlertObj) {
        if (this.currHeaderAlert != null) {
            this.leftContainerAlert.removeChild(this.currHeaderAlert.contentLeft);
            this.rightContainerAlert.removeChild(this.currHeaderAlert.contentRight);
        }

        this.currHeaderAlert = headerAlertObj;

        this.leftContainerAlert.addChild(this.currHeaderAlert.contentLeft);
        this.rightContainerAlert.addChild(this.currHeaderAlert.contentRight);

        this.leftContainerAlert.onEndFadeInCallback = () => this.startAlertStayTimer();
        this.rightContainerAlert.onEndFadeInCallback = () => this.startAlertStayTimer();

        this.leftContainerAlert.fadeIn();
        this.rightContainerAlert.fadeIn();
    }

    createAlert(title, content) {
        var alertTitleWidget = new PIXI.Text(
            title,
            FONT_STYLE,
        );

        var alertContentWidget = new PIXI.Text(
            content,
            FONT_STYLE,
        );

        var headerAlertObj = new HeaderInfo("Alerte_" + title, alertTitleWidget, alertContentWidget, ALERT_DURATION, null);

        this.addAlert(headerAlertObj);
    }
}
