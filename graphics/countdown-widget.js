class CountdownWidget extends PIXI.Container {
	constructor(x, y) {
		super(x, y)

		this.timelimit = -1;
		this.textWidget = new PIXI.Text("00:00:00", TEXT_STYLE);

		this.addChild(this.textWidget);

		app.ticker.add(this.update, this);

		this.animTime = 0;
	}

	setTimeLimit(newTimestamp) {
		this.timelimit = newTimestamp;
	}

	update(delta) {
		var timeCurrent = new Date().getTime();
		var timeLimit = new Date(this.timelimit);
		var timeRemaining = Math.floor(timeLimit - timeCurrent);

		if (timeRemaining <= 0) {
			this.textWidget.text = "00:00:00"

			if (Math.floor((timeCurrent / 500) % 2) == 0) {
				this.alpha = 0;
			}
			else {
				this.alpha = 1;
			}
		}
		else {
			var hours = Math.floor((timeRemaining / 1000) / 3600);
			var minutes = Math.floor((timeRemaining / 1000) / 60);
			var seconds = Math.floor((timeRemaining / 1000) % 60);
			this.textWidget.text = hours.toString().padStart(2, '0') + ":" + minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0');
		}
	}
}