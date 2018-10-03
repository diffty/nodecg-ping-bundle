PIXI.glCore.GLTexture.prototype.upload = function(source)
{
	this.bind();

	var gl = this.gl;

	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.premultiplyAlpha);

        var isVideo = !!source.videoWidth;
	var newWidth = isVideo ? source.videoWidth : source.width;
	var newHeight = isVideo ? source.videoHeight : source.height;

	if(newHeight !== this.height || newWidth !== this.width || isVideo)
	{
		gl.texImage2D(gl.TEXTURE_2D, 0, this.format, this.format, this.type, source);
	}
	else
	{
		gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this.format, this.type, source);
	}

	this.width = newWidth;
	this.height = newHeight;

};
