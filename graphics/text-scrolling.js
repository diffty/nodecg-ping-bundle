// INFINITE SCROLLING TEXT
class ScrollingText extends PIXI.Container {
    constructor(x, y, width, height, text, spacing=0) {
        super();

        this.textObjList = [];

        this.spacing = spacing;
        this.bounds = new PIXI.Rectangle(0, 0, width, height);
        
        this.mask = new PIXI.Graphics();
        this.addChild(this.mask);
        this.updateMask();

        this.setText(text);

        this.setTransform(x, y);

        app.ticker.add(this.update, this);
    }

    update(delta) {
        if (this.textObjList.length > 0) {
          let pushOffsetX = -delta;

            if (this.textObjList[0].x < -this.textObjList[0].getBounds().width) {
                pushOffsetX = this.textObjList[0].getBounds().width + this.spacing;
            }

            this.textObjList.forEach(function(textObj) {
                textObj.setTransform(textObj.x + pushOffsetX, textObj.y);
            })
        } 
    }

    updateMask() {
        this.mask.clear();
        this.mask.drawRect(0, 0, this.bounds.width, this.bounds.height);
    }

    setText(text) {
        this.destroyTextWidgets();
        this.createTextWidgets(text);
    }

    createTextWidgets(text) {
        let currXPos = 0;

        let textObjWidth = 0;

        while (currXPos < this.bounds.width + textObjWidth) {
            var newTextObj = new PIXI.Text(text, {fontFamily : "brownie-regular", fontSize: 40, fill : 0xffffff, align : 'center'});

            newTextObj.x = currXPos;

            this.textObjList.push(newTextObj);
            this.addChild(newTextObj);

            currXPos += newTextObj.width + this.spacing;
            textObjWidth = newTextObj.width;
        }
    }

    destroyTextWidgets() {
        this.textObjList.forEach(function(textObj) {
            this.removeChild(textObj);
        }, this)

        this.textObjList = [];
    }
}