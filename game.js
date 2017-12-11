game.newLoopFromConstructor('game', function () {

	var map = LEVELS[0];

	var plStartPosition = false;

	var walls = [];
	var bitcoins = [];
	var waters = [];
	var fires = [];
	var checks = [];
	var portals = [];

    var imagePlayer = pjs.tiles.newImage('img/morti.png');

    var animPlayerStand = imagePlayer.getAnimation(0, 0, 175, 210, 1);
    var animPlayerGo = imagePlayer.getAnimation(0, 0, 175, 210, 4);

    var player = game.newAnimationObject({
        x : 0, y : 0,
        w : 40, h : 70,
        animation : animPlayerStand,
        delay : 5,
        box : {
            offset : point(8),
            size : pjs.vector.size(-16)
        }
    });

    var imageFire = pjs.tiles.newImage('img/fire1.png');
    var animFireStand = imageFire.getAnimation(0, 0, 180, 180, 3);


    var imageFireMove = pjs.tiles.newImage('img/fire2.png');
    var animFireMove = imageFireMove.getAnimation(0, 0, 127, 120, 4);

	var restartGame = function () {
		player.setPositionC(plStartPosition);
		camera.setPositionC(plStartPosition);
	};

	var nextLevel = function () {
		if (level >= LEVELS.length)
			level = 1;

		level++;
		map = LEVELS[level - 1];
	};

	var EDITOR = game.newTextObject({
		text : 'Меню',
		color : 'white',
		size : 30
	});

	this.entry = function () {

		var snd = pjs.wAudio.newAudio(map.snd, 0.3);
		game.setLoopSound('game', [snd]);

		score = 0;
		OOP.clearArr(walls);
		OOP.clearArr(bitcoins);
		OOP.clearArr(waters);
		OOP.clearArr(fires);
		OOP.clearArr(checks);
		OOP.clearArr(portals);

        OOP.forArr(map.source, function (string, Y) {
            OOP.forArr(string, function (symbol, X) {
                if (!symbol || symbol == ' ') return;

                if (symbol == 'P') {
                    plStartPosition = point(map.width*X, map.height*Y);
                } else if (symbol == 'W') {
                    waters.push(game.newRectObject({
                        w : map.width, h : map.height,
                        x : map.width*X, y : map.height*Y,
                        fillColor : '#084379',
                        alpha : 0.5
                    }));
                } else if (symbol == '|') {
                    bitcoins.push(game.newImageObject({
                        w : map.width/2, h : map.height/2,
                        x : map.width*X + map.width/4, y : map.height*Y+10,
                        file : 'img/bitcoin.png',
                        userData : {
                            active : true,
                            mp : point(map.width*X, map.height*Y+10)
                        }
                    }));
                } else if (symbol == '0') {
                    walls.push(game.newImageObject({
                        w : map.width, h : map.height,
                        x : map.width*X, y : map.height*Y,
                        file : 'img/block.jpg'
                    }));
                } else if (symbol == 'E') {
                    fires.push(game.newAnimationObject({
                        w : 40, h : 40,
                        x : map.width*X+10 , y : map.height*Y+20,
                        animation : animFireStand,
                        delay : 10,
                        box : {
                            offset : point(8),
                            size : pjs.vector.size(-16)
                        }
                    }));
                } else if (symbol == '/') {
                    walls.push(game.newImageObject({
                        w : map.width, h : map.height,
                        x : map.width*X, y : map.height*Y,
                        file : 'img/blockAngle.png',
                        userData : {
                            speedY : -1
                        }
                    }));
                } else if (symbol == '\\') {
                    walls.push(game.newImageObject({
                        w : map.width, h : map.height,
                        x : map.width*X, y : map.height*Y,
                        file : 'img/blockAngle.png',
                        userData : {
                            speedY : 1
                        }
                    }));
                } else if (symbol == '*') {
                    fires.push(game.newAnimationObject({
                        w : 40, h : 40,
                        x : map.width*X , y : map.height*Y,
                        animation : animFireMove,
                        delay : 3,
                        userData : {
                            mp : point(map.width*X, map.height*Y)
                        }
                    }));
                } else if (symbol == 'F') {
                    checks.push(game.newImageObject({
                        w : map.width, h : map.height * 2,
                        x : map.width*X, y : map.height*Y - map.height,
                        file : 'img/flag.png',
                        userData : {
                            active : true
                        }
                    }));
                } else if (symbol == 'X') {
                    portals.push(game.newImageObject({
                        w : map.width, h : map.height * 2,
                        x : map.width*X, y : map.height*Y - map.height,
                        file : 'img/portal.png',
                        userData : {
                            bonus : false
                        }
                    }));
                }






            });
        });

		player.gr = 0.5;
		player.speed = point(0, 0);

		if (plStartPosition) {
			player.setPositionC(plStartPosition);
		}

	};

	this.update = function () {
		game.clear();
		player.draw();

		player.speed.y += player.gr;

		if (key.isDown('RIGHT')) {
            player.setFlip(0, 0);
            player.speed.x = 2;
        }
		else if (key.isDown('LEFT')) {
            player.setFlip(1, 0);
            player.speed.x = -2;
        }
		else if (player.speed.y > 0)
			player.speed.x = math.toZiro(player.speed.x, 0.1);

		OOP.drawArr(walls, function (wall) {
			if (wall.isInCameraStatic()) {

				if (wall.speedY > 0)
					wall.setFlip(point(1, 0));

				if (wall.isStaticIntersect(player)) {

					if (wall.speedY) {
						player.speed.x = math.toZiro(player.speed.x, 0.1);

						if (player.getDistanceC(wall.getPositionC()) < 50)
							player.speed.y = wall.speedY * player.speed.x;

						return;
					}

					if (player.x+player.w > wall.x+wall.w/4 && player.x < wall.x+wall.w-wall.w/4) {
						if (player.speed.y > 0 && player.y+player.h < wall.y+wall.h/2) {
							if (key.isDown('UP'))
								player.speed.y = -10;
							else {
								player.y = wall.y - player.h;
								player.speed.y *= -0.3;
								if (Math.abs(player.speed.y) < 1)
									player.speed.y = 0;
							}
						} else if (player.speed.y < 0 && player.y > wall.y+wall.h/2) {
							player.y = wall.y+wall.h;
							player.speed.y *= -0.1;
						}
					}

					if (player.y+player.h > wall.y+wall.h/4 && player.y < wall.y+wall.h-wall.h/4) {

						if (player.speed.x > 0 && player.x+player.w < wall.x+wall.w/2) {
							player.x = wall.x-player.w;
							player.speed.x = 0;
						}

						if (player.speed.x < 0 && player.x > wall.x+wall.w/2) {
							player.x = wall.w+wall.x;
							player.speed.x = 0;
						}
					}

				}
			}
		});

		OOP.drawArr(portals, function (portal) {
			if (portal.isStaticIntersect(player)) {
				nextLevel();
				game.setLoop('game');
			}
		});

		OOP.drawArr(checks, function (check) {
			if (check.active) {
				if (check.isStaticIntersect(player)) {
					check.active = false;
					plStartPosition = check.getPositionC();
				}
			}
		});

		OOP.drawArr(bitcoins, function (bitcoin) {
			if (bitcoin.active) {
				if (bitcoin.isStaticIntersect(player)) {
                    bitcoin.active = false;
                    bitcoin.setImage('');
					score++;
				}
                if (bitcoin.mp) {
                    bitcoin.motion(bitcoin.mp, pjs.vector.size(0, map.width * 0.05), 6);
                }
			}
		});

		OOP.drawArr(fires, function (fire) {

			if (fire.mp) {
				fire.motion(fire.mp, pjs.vector.size(map.width * 3, map.width * 3), 2);
			}

			if (fire.isStaticIntersect(player)) {
                restartGame();
			}
		});



		var onWater = false;
		OOP.drawArr(waters, function (water) {
			if (onWater) return;
			if (water.isStaticIntersect(player) && player.y+player.h/2 > water.y) {
				player.speed.y -= 0.9;
				onWater = true;
			}
		});

		if (player.speed.y) {
			player.y += player.speed.y;
		}

		if (player.speed.x) {
            player.setAnimation(animPlayerGo);
            player.x += player.speed.x;
		}else {
            player.setAnimation(animPlayerStand);
        }


		brush.drawTextS({
			text : 'Level: '+level+' Score: '+score,
			size : 30,
			color : '#FFFFFF',
			strokeColor : '#002C5D',
			strokeWidth : 1,
			x : 10, y : 10,
			style : 'bold'
		});


		EDITOR.setPositionS(point(game.getWH().w - EDITOR.getSize().w, 0));
		EDITOR.draw();

		if (mouse.isPeekObject('LEFT', EDITOR)) {
			game.setLoop('menu');
			return;
		}

		camera.follow(player, 50);

	};
});