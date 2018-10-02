// INFINITE SCROLLING CONTAINER
class ScrollingContainer extends PIXI.Container {
    constructor(obj, x, y, width, height, spacing=0, noMask=true) {
        super();

        this.objList = [];
        this.obj = null;

        this.spacing = spacing;
        this.bounds = new PIXI.Rectangle(0, 0, width, height);
        
        this.setObj(obj);
        
        if (!noMask) {
            this.mask = new PIXI.Graphics();
            this.addChild(this.mask);
            this.updateMask();
        }

        this.setTransform(x, y);

        app.ticker.add(this.update, this);
    }

    update(delta) {
        if (this.objWidth != this.obj.width || this.objHeight != this.obj.height) {
            this.regenerateContainers();
        }

        if (this.objList.length > 0) {
            app.renderer.render(this.obj, this.renderTexture);

            let pushOffsetX = -delta;

            if (this.objList[0].x < -this.objList[0].getBounds().width) {
                pushOffsetX = this.objList[0].getBounds().width + this.spacing;
            }

            this.objList.forEach(function(obj) {
                obj.setTransform(obj.x + pushOffsetX, obj.y);
            }, this)
        } 
    }

    updateMask() {
        this.mask.clear();
        this.mask.drawRect(0, 0, this.bounds.width, this.bounds.height);
    }

    setObj(newObj) {
        this.obj = newObj;
        this.regenerateContainers();
    }

    regenerateContainers() {
        this.destroyContainers();
        this.createContainers();

        this.objWidth = this.obj.width;
        this.objHeight = this.obj.height;
    }

    createContainers() {
        let currXPos = 0;

        this.renderTexture = new PIXI.RenderTexture(this.obj.texture);
        this.renderTexture.resize(this.obj.width, this.obj.height, false);

        while (currXPos < this.bounds.width + this.obj.width) {
            let baseDrawObj = new PIXI.Sprite(this.renderTexture);

            baseDrawObj.x = currXPos;

            this.objList.push(baseDrawObj);
            this.addChild(baseDrawObj);

            currXPos += this.obj.width + this.spacing;
        }
    }

    destroyContainers() {
        this.objList.forEach(function(containerObj) {
            this.removeChild(containerObj);
        }, this)

        this.objList = [];
    }
}