PS_MAIN_TEXTURE = {
    STARS: ["star_b.png", "star_g.png", "star_p.png", "star_r.png", "star_y.png"]
};

PS_MAIN_SOUNDS = {
    click: "Resources/sounds/click.mp3",
    broken: "Resources/sounds/broken.mp3",
    select: "Resources/sounds/select.mp3"
};


var MainLayer = function () {
    this.pauseNode = this.pauseNode || {};
    cc.log("MainLayer");
    this.numX = 10;
    this.numY = 10;
    this.starSize = 72;
    this.sameColorList = [];
};

MainLayer.prototype.onDidLoadFromCCB = function () {
    if (sys.platform == 'browser') {
        this.onEnter();
    }
    else {
        this.rootNode.onEnter = function () {
            this.controller.onEnter();
        };
    }

    this.rootNode.onExit = function () {
        this.controller.onExit();
    };

    this.rootNode.onTouchesBegan = function (touches, event) {
        this.controller.onTouchesBegan(touches, event);
        return true;
    };

    this.rootNode.onTouchesMoved = function (touches, event) {
        this.controller.onTouchesMoved(touches, event);
        return true;
    };
    this.rootNode.onTouchesEnded = function (touches, event) {
        this.controller.onTouchesEnded(touches, event);
        return true;
    };

    this.rootNode.setTouchEnabled(true);
};

MainLayer.prototype.onEnter = function () {
    cc.log("onEnter");
    this.pauseNode.setZOrder(120);
    this.initStarTable();
}

MainLayer.prototype.initStarTable = function () {
    this.starTable = new Array(this.numX);
    for (var i = 0; i < this.numX; i++) {
        var sprites = new Array(this.numY);
        for (var j = 0; j < this.numY; j++) {
            /*if (i == 2) {
             sprites[j] = null;
             continue;
             }*/

            var pSprite0 = this.getRandomStar(i, j);
            if (pSprite0 != null) {
                this.rootNode.addChild(pSprite0);
            }

            sprites[j] = pSprite0;
        }
        this.starTable[i] = sprites;
    }
}

MainLayer.prototype.getRandomStar = function (colIndex, rowIndex) {

    var stars = PS_MAIN_TEXTURE.STARS;
    var colors = ["blue", "green", "purple", "red", "yellow"];
    var random = getRandom(stars.length);
    var randomStar = stars[random];
    var starSprite = cc.Sprite.createWithSpriteFrameName(randomStar);
    starSprite.setAnchorPoint(cc.p(0.5, 0.5));
    starSprite.setPosition(cc.p(36 + colIndex * this.starSize,
        1300));
    starSprite.starData = {name: randomStar, color: colors[random], indexOfColumn: colIndex, indexOfRow: rowIndex};
    starSprite.setZOrder(100);

    var flowTime = rowIndex / 10;
    var fallAction = cc.MoveTo.create(flowTime, cc.p(36 + colIndex * this.starSize,
        36 + rowIndex * this.starSize));
    starSprite.runAction(fallAction);
    return starSprite;
}


MainLayer.prototype.onUpdate = function () {

}

MainLayer.prototype.onExitClicked = function () {
    cc.log("onExitClicked");
}


MainLayer.prototype.onExit = function () {
    cc.log("onExit");
}

MainLayer.prototype.onPauseClicked = function () {
    this.pauseNode.setVisible(true);
}

MainLayer.prototype.onResumeClicked = function () {
    this.pauseNode.setVisible(false);
}


MainLayer.prototype.onSaveExitClicked = function () {
    cc.BuilderReader.runScene("", "StartLayer");
}

MainLayer.prototype.checkOneStarFourSide = function (sprite) {
    if (sprite == null) {
        return;
    }
    // cc.log("checkOneStarFourSide");
    var fourSideSpriteList = [];
    var color = sprite.starData.color;
    var col = sprite.starData.indexOfColumn;
    var row = sprite.starData.indexOfRow;

    //up
    if (row < 9) {
        var upSprite = this.starTable[col][row + 1];
        if (upSprite != null && upSprite.starData.color == color) {
            fourSideSpriteList.push(upSprite);
        }
    }

    //down
    if (row > 0) {
        var downSprite = this.starTable[col][row - 1];
        if (downSprite != null && downSprite.starData.color == color) {
            fourSideSpriteList.push(downSprite);
        }
    }

    //left
    if (col > 0) {
        var leftSprite = this.starTable[col - 1][row];
        if (leftSprite != null && leftSprite.starData.color == color) {
            fourSideSpriteList.push(leftSprite);
        }
    }

    //right
    if (col < 9) {
        var rightSprite = this.starTable[col + 1][row];
        if (rightSprite != null && rightSprite.starData.color == color) {
            fourSideSpriteList.push(rightSprite);
        }
    }
    return fourSideSpriteList;
}

MainLayer.prototype.checkSameColorStars = function (sprite) {
    if (sprite == null) {
        return;
    }
    this.sameColorList = [];
    this.sameColorList.push(sprite);
    var newSameColorList = [];
    newSameColorList.push(sprite);

    //by logic ,check the same color star list
    while (newSameColorList.length > 0) {
        for (var i = 0; i < newSameColorList.length; i++) {
            var fourSide = this.checkOneStarFourSide(newSameColorList[i]);
            if (fourSide.length > 0) {
                for (var j = 0; j < fourSide.length; j++) {
                    if (!this.sameColorList.contains(fourSide[j])) {
                        this.sameColorList.push(fourSide[j]);
                        newSameColorList.push(fourSide[j]);
                    }
                }
            }
            newSameColorList.splice(i, 1);
        }
    }
    cc.log("sameColorList length==" + this.sameColorList.length);
    if (this.sameColorList.length > 1) {
        for (var k = 0; k < this.sameColorList.length; k++) {
            var simpleStar = this.sameColorList[k];
            if (simpleStar) {
                simpleStar.runAction(cc.ScaleTo.create(0.1, 1.08));
            }
        }
    }
}

MainLayer.prototype.removeSameColorStars = function () {
    for (var k = 0; k < this.sameColorList.length; k++) {
        var simpleStar = this.sameColorList[k];
        if (simpleStar) {
            var col = simpleStar.starData.indexOfColumn;
            var row = simpleStar.starData.indexOfRow;
            this.starTable[col].splice(row, 1, null);
            this.rootNode.removeChild(simpleStar);
            if (sys.platform != 'browser') {
                var starParticle = cc.StarParticle.create(this.rootNode, (36 + col * this.starSize), (36 + row * this.starSize), "spark");
                starParticle.runAction(cc.Sequence.create(cc.DelayTime.create(0.8), cc.CleanUp.create(starParticle)));
            }
        }
    }
    this.sameColorList = [];
    this.fallStar();
}


MainLayer.prototype.fallStar = function () {
    for (var i = 0; i < this.starTable.length; i++) {
        var sprites = this.starTable[i];
        var length = sprites.length;
        for (var j = 0; j < length; j++) {
            var pSprite0 = sprites[j];
            if (pSprite0 == null) {
                var k = j + 1;
                while (k < length) {
                    var upSprite = sprites[k];
                    if (upSprite != null) {
                        upSprite.starData.indexOfColumn = i;
                        upSprite.starData.indexOfRow = j;
                        this.starTable[i].splice(j, 1, upSprite);
                        this.starTable[i].splice(k, 1, null);
                        k = length;
                        var flowTime = 0.2;
                        var fallAction = cc.MoveTo.create(flowTime, cc.p(36 + i * this.starSize,
                            36 + j * this.starSize));
                        upSprite.runAction(fallAction);
                    }
                    k++;
                }
            }
        }
    }

    this.deadStar();
    // this.combineStar();
}

MainLayer.prototype.combineStar = function () {
    for (var m = 0; m < this.starTable.length; m++) {
        var mSprite0 = this.starTable[m][0];
        if (mSprite0 == null) {
            if (m == (this.starTable.length - 1)) {
                for (var j = 0; j < this.starTable[m].length; j++) {
                    this.starTable[m].splice(j, 1, null);
                }
            }
            else {
                for (var i = (m + 1); i < this.starTable.length; i++) {
                    // this.starTable.splice((i - 1), 1, this.starTable[i]);
                    for (var j = 0; j < this.starTable[i].length; j++) {
                        var pSprite0 = this.starTable[i][j];
                        this.starTable[i - 1].splice(j, 1, pSprite0);
                        if (pSprite0 != null) {
                            pSprite0.starData.indexOfColumn = (i - 1);
                            var col = pSprite0.starData.indexOfColumn;
                            var row = pSprite0.starData.indexOfRow;
                            var moveAction = cc.MoveTo.create(0.1, cc.p(36 + col * this.starSize,
                                36 + row * this.starSize));
                            pSprite0.runAction(moveAction);
                        }
                    }
                }
            }
        }
    }
    this.deadStar();
}


MainLayer.prototype.deadStar = function () {
    var isDead = true;
    for (var i = 0; i < this.starTable.length; i++) {
        var sprites = this.starTable[i];
        var length = sprites.length;
        for (var j = 0; j < length; j++) {
            var pSprite0 = sprites[j];
            if (pSprite0 != null) {
                if (this.checkOneStarFourSide(pSprite0).length > 0) {
                    isDead = false;
                    return;
                }
            }
        }
    }

    if (isDead) {
        for (var jj = 9; jj >= 0; jj--) {
            for (var ii = 0; ii < 10; ii++) {
                var pSprite0 = this.starTable[ii][jj];
                if (pSprite0 != null) {
                    var delay = 4 + 0.3 * ii - 0.4 * jj;
                    pSprite0.runAction(cc.Sequence.create(
                        cc.DelayTime.create(delay),
                        cc.CleanUp.create(pSprite0)
                    ));
                    var starParticle = cc.StarParticle.create(this.rootNode, (36 + ii * this.starSize), (36 + jj * this.starSize), "spark");
                    starParticle.runAction(cc.Sequence.create(cc.ScaleTo.create(0, 0),
                        cc.DelayTime.create(delay), cc.ScaleTo.create(0, 1), cc.DelayTime.create(0.8),
                        cc.CleanUp.create(starParticle)));
                }
            }
        }
    }
}


MainLayer.prototype.onTouchesBegan = function (touches, event) {
    var loc = touches[0].getLocation();
    this.ccTouchBeganPos = loc;

    for (var i = 0; i < this.starTable.length; i++) {
        var sprites = this.starTable[i];
        for (var j = 0; j < sprites.length; j++) {
            var pSprite0 = sprites[j];
            if (pSprite0) {
                var ccRect = pSprite0.getBoundingBox();
                if (isInRect(ccRect, this.ccTouchBeganPos)) {
                    if (this.sameColorList.length > 1) {
                        if (this.sameColorList.contains(pSprite0)) {
                            cc.AudioEngine.getInstance().playEffect(PS_MAIN_SOUNDS.broken, false);
                            this.removeSameColorStars();
                        } else {
                            for (var k = 0; k < this.sameColorList.length; k++) {
                                if (this.sameColorList[k]) {
                                    this.sameColorList[k].runAction(cc.ScaleTo.create(0.1, 1));
                                }
                            }
                            this.checkSameColorStars(pSprite0);
                            if (this.sameColorList.length > 1) {
                                cc.AudioEngine.getInstance().playEffect(PS_MAIN_SOUNDS.select, false);
                            }
                        }
                    } else {
                        this.checkSameColorStars(pSprite0);
                        if (this.sameColorList.length > 1) {
                            cc.AudioEngine.getInstance().playEffect(PS_MAIN_SOUNDS.select, false);
                        }
                    }

                    break;
                }
            }
        }
    }
};


MainLayer.prototype.onTouchesMoved = function (touches, event) {
}

MainLayer.prototype.onTouchesEnded = function (touches, event) {
}


function getRandom(maxSize) {
    return Math.floor(Math.random() * maxSize) % maxSize;
}

function isInRect(ccRect, ccTouchBeganPos) {
    if (ccTouchBeganPos.x > ccRect.x && ccTouchBeganPos.x < (ccRect.x + ccRect.width)) {
        if (ccTouchBeganPos.y > ccRect.y && ccTouchBeganPos.y < (ccRect.y + ccRect.height)) {
            return true;
        }
    }
    return false;
}

