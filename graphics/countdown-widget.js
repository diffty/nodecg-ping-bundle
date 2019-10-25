class CountdownWidget extends PIXI.Container {
	constructor(x, y, textStyle, isRunning, initTimeRemaining) {
		super(x, y)

		this.initTimeRemaining = initTimeRemaining;
		this.timeRemaining = initTimeRemaining;
		this.isRunning = isRunning || false;
		this.textWidget = new PIXI.Text("00:00:00", textStyle);

		this.addChild(this.textWidget);

		app.ticker.add(this.update, this);

		this.animTime = 0;
	}

	setTimeRemaining(newTimeRemaining) {
		this.initTimeRemaining = newTimeRemaining;
		this.timeRemaining = newTimeRemaining;
		this.updateText();
	}

	setIsRunning(newIsRunning) {
		this.isRunning = newIsRunning;
	}

	start() {
		this.setIsRunning(true);
	}

	stop() {
		this.setIsRunning(false);
	}

	reset() {
		this.setIsRunning(false);
		this.setTimeRemaining(this.initTimeRemaining);
	}

	updateText() {
		var hours = Math.floor(this.timeRemaining / 60. / 60.);
		var minutes = Math.floor(this.timeRemaining / 60.) % 60;
		var seconds = Math.floor(this.timeRemaining) % 60;
		this.textWidget.text = hours.toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0');
	}

	update(delta) {
		if (this.isRunning) {
			this.timeRemaining -= (app.ticker.elapsedMS / 1000.);

			if (this.timeRemaining <= 0) {
				this.textWidget.text = "00:00:00"
				if (Math.floor((Math.abs(this.timeRemaining))) % 2 == 0) {
					this.alpha = 0;
				}
				else {
					this.alpha = 1;
				}
			}
			else {
				if (this.isRunning === true) {
					this.alpha = 1;
					this.updateText();
				}
			}
		}
	}
}