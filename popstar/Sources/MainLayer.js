/**
 * @GameName :
 * popstar
 *
 * @DevelopTool:
 * Cocos2d-x Editor (CocosEditor)
 *
 * @time
 * 2014-02-23 pm
 *
 * @Licensed:
 * This showcase is licensed under GPL.
 *
 * @Authors:
 * Programmer: touchSnow
 *
 * @Links:
 * http://www.cocos2d-x.com/ (cocos官方)
 * https://github.com/makeapp      （github）
 * http://blog.csdn.net/touchsnow (csdn博客)
 * http://blog.makeapp.co/ （官方博客）
 * http://www.cocoseditor.com/ （建设中官网）
 *
 * @Contact
 * 邮箱：zuowen@makeapp.co
 * qq群：232361142
 *
 */

PS_MAIN_TEXTURE = {
    STARS: ["star_b.png", "star_g.png", "star_p.png", "star_r.png", "star_y.png"]
};

PS_MAIN_SOUNDS = {
    click: "Resources/sounds/click.mp3",
    broken: "Resources/sounds/broken.mp3",
    select: "Resources/sounds/select.mp3",
    gameover: "Resources/sounds/gameover.mp3",
    stageclear: "Resources/sounds/stageclear.mp3",
    win: "Resources/sounds/win.mp3"
};


var MainLayer = function ()
{
    this.pauseNode = this.pauseNode || {};
    cc.log("MainLayer");
    this.numX = 10;
    this.numY = 10;
    this.starSize = 72;
    this.sameColorList = [];

    //fonts
    this.bestScoreFont = {};
    this.stageFont = {};
    this.targetFont = {};
    this.scoreFont = {};
    this.scoreTipLabel = {};
    this.tipLabel = {};

    this.nextSprite = {};
    this.nextLevelLabel = {};
    this.nextTargetLabel = {};

    this.totalScore = 0;

    this.isClear = false;
};

MainLayer.prototype.onDidLoadFromCCB = function ()
{
    if (sys.platform == 'browser') {
        this.onEnter();
    }
    else {
        this.rootNode.onEnter = function ()
        {
            this.controller.onEnter();
        };
    }

    this.rootNode.onTouchesBegan = function (touches, event)
    {
        this.controller.onTouchesBegan(touches, event);
        return true;
    };

    this.rootNode.onTouchesMoved = function (touches, event)
    {
        this.controller.onTouchesMoved(touches, event);
        return true;
    };
    this.rootNode.onTouchesEnded = function (touches, event)
    {
        this.controller.onTouchesEnded(touches, event);
        return true;
    };

    this.rootNode.setTouchEnabled(true);
};

MainLayer.prototype.onEnter = function ()
{
    cc.log("onEnter");
    this.canTouch = true;
    this.pauseNode.setZOrder(120);

    //init stars
    this.initStarTable();

    //stage
    this.stageFont.setString(currentLevel + "");

    //target  score
    this.targetScore = 1000 * (1 + currentLevel) * currentLevel / 2;
    this.targetFont.setString(this.targetScore + "");

    //score
    this.totalScore = currentLevelScore;
    this.scoreFont.setString(this.totalScore + "");

    //score tip
    this.scoreTipLabel.setVisible(false);
    this.tipLabel.setVisible(false);
    this.tipLabel.setZOrder(10);

    //best score
    this.bestScore = sys.localStorage.getItem("starBestScore");
    if (this.bestScore != null && this.bestScore != undefined) {
        this.bestScore = Number(this.bestScore);
    }
    else {
        this.bestScore = 0;
    }
    this.bestScoreFont.setString(this.bestScore + "");
}

MainLayer.prototype.initStarTable = function ()
{
    this.starTable = new Array(this.numX);
    for (var i = 0; i < this.numX; i++) {
        var sprites = new Array(this.numY);
        for (var j = 0; j < this.numY; j++) {
            var pSprite0 = this.getRandomStar(i, j);
            if (pSprite0 != null) {
                this.rootNode.addChild(pSprite0);
            }

            sprites[j] = pSprite0;
        }
        this.starTable[i] = sprites;
    }
}

MainLayer.prototype.getRandomStar = function (colIndex, rowIndex)
{
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
};


MainLayer.prototype.onPauseClicked = function ()
{
    this.pauseNode.setVisible(true);
};

MainLayer.prototype.onResumeClicked = function ()
{
    this.pauseNode.setVisible(false);
};


MainLayer.prototype.onSaveExitClicked = function ()
{
    cc.BuilderReader.runScene("", "StartLayer");
}

MainLayer.prototype.checkOneStarFourSide = function (sprite)
{
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

MainLayer.prototype.checkSameColorStars = function (sprite)
{
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
    // cc.log("sameColorList length==" + this.sameColorList.length);
    if (this.sameColorList.length > 1) {
        for (var k = 0; k < this.sameColorList.length; k++) {
            var simpleStar = this.sameColorList[k];
            if (simpleStar) {
                simpleStar.runAction(cc.ScaleTo.create(0.1, 1.08));
            }
        }
    }
}

MainLayer.prototype.removeSameColorStars = function ()
{
    var length = this.sameColorList.length;
    this.oneStarScore = 5 * length;

    for (var k = 0; k < length; k++) {
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

            var starScoreSprite = cc.StarLabel.createScore(this.rootNode, cc.p((36 + col * this.starSize), (36 + row * this.starSize)), this.oneStarScore + "");
            starScoreSprite.runAction(cc.Sequence.create(
                    cc.MoveTo.create(0.3 + k / 20, this.scoreFont.getPosition()),
                    cc.CleanUp.create(starScoreSprite),
                    cc.CallFunc.create(function ()
                    {
                        this.totalScore += this.oneStarScore;
                        this.scoreFont.setString(this.totalScore + "");
                        if (this.totalScore >= this.targetScore) {
                            if (this.isClear == false) {
                                this.isClear = true;
                                this.tipLabel.setVisible(true);
                                this.tipLabel.setString("Clear!");
                                this.tipLabel.runAction(cc.Sequence.create(cc.DelayTime.create(1),
                                        cc.MoveTo.create(1, cc.p(110, 1000))
                                ));
                                cc.AudioEngine.getInstance().playEffect(PS_MAIN_SOUNDS.stageclear);
                            }
                        }
                    }, this)
            ));

        }
    }
    this.sameColorList = [];
    this.fallStar();
};


MainLayer.prototype.fallStar = function ()
{
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
                    }
                    k++;
                }
            }
        }
    }
    this.combineStar();
};


MainLayer.prototype.checkCombineStar = function ()
{
    for (var m = 0; m < (this.starTable.length - 1); m++) {
        if (this.starTable[m][0] == null && this.starTable[m + 1][0] != null) {
            return m;
        }
    }
    return -1;
};

MainLayer.prototype.combineStar = function ()
{
    while (this.checkCombineStar() >= 0) {
        var m = this.checkCombineStar();
        if (m == (this.starTable.length - 1)) {      //last length
            for (var k = 0; k < this.starTable[m].length; k++) {
                this.starTable[m].splice(k, 1, null);
            }
        }
        else {
            for (var i = (m + 1); i < this.starTable.length; i++) {
                for (var j = 0; j < this.starTable[i].length; j++) {
                    if (this.starTable[i][j] != null) {
                        this.starTable[i][j].starData.indexOfColumn = (i - 1);
                    }
                    this.starTable[i - 1].splice(j, 1, this.starTable[i][j]);
                    if (i == (this.starTable.length - 1)) {
                        this.starTable[i].splice(j, 1, null);
                    }
                }
            }
        }
    }

    this.moveStar();
};


MainLayer.prototype.moveStar = function ()
{
    for (var i = 0; i < this.starTable.length; i++) {
        var sprites = this.starTable[i];
        var length = sprites.length;
        var jj = i + "==  ";
        for (var j = 0; j < length; j++) {
            var pSprite0 = sprites[j];
            if (pSprite0) {
                var moveAction = cc.MoveTo.create(0.18, cc.p(36 + i * this.starSize, 36 + j * this.starSize));
                this.starTable[i][j].runAction(moveAction);
                jj += pSprite0.starData.color + pSprite0.starData.indexOfColumn + pSprite0.starData.indexOfRow + "    ";
            }
            else {
                jj += "xxx" + i + j + "    ";
            }
        }
        cc.log(jj);
    }
    this.deadStar();
}

MainLayer.prototype.deadStar = function ()
{
    cc.log("deadStar");
    var isDead = true;
    var deadCount = 0;
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
                else {
                    deadCount += 1;
                }
            }
        }
    }

    if (isDead) {
        this.canTouch = false;
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

                    if (deadCount < 10) {
                        if (deadCount == 0) {
                            this.totalScore += 1000;
                            this.scoreFont.setString(this.totalScore + "");
                        }

                        this.oneDeadStarScore = Math.floor((1000 - deadCount * 100) / deadCount);
                        this.oneDeadStarScore = this.oneDeadStarScore - this.oneDeadStarScore % 10;
                        var starScoreSprite = cc.StarLabel.createScore(this.rootNode,
                                cc.p((36 + ii * this.starSize), (36 + jj * this.starSize)), this.oneDeadStarScore + "");
                        starScoreSprite.runAction(cc.Sequence.create(
                                cc.ScaleTo.create(0, 0),
                                cc.DelayTime.create(delay), cc.ScaleTo.create(0, 1),
                                cc.MoveTo.create(0.3 + jj / 20, this.scoreFont.getPosition()),
                                cc.CleanUp.create(starScoreSprite),
                                cc.CallFunc.create(function ()
                                {
                                    this.totalScore += this.oneDeadStarScore;
                                    this.scoreFont.setString(this.totalScore + "");
                                }, this)
                        ));
                    }
                }
            }
        }
    }

    var that = this;
    this.rootNode.scheduleOnce(function ()
    {
        that.winStar();
    }, 5);
};

MainLayer.prototype.winStar = function ()
{
    if (this.isClear == true) {
        cc.AudioEngine.getInstance().playEffect(PS_MAIN_SOUNDS.win);
        cc.Toast.create(this.rootNode, "Win", 3);
        currentLevel += 1;
        currentLevelScore = this.totalScore;

        this.nextSprite.setZOrder(100);
        var that = this;
        this.rootNode.scheduleOnce(function ()
        {
            that.nextLevelLabel.setString("level " + currentLevel + "");
            that.nextTargetLabel.setString("target " + 1000 * (1 + currentLevel) * currentLevel / 2);
            that.nextSprite.runAction(cc.Sequence.create(
                    cc.MoveTo.create(1, cc.p(0, 0)),
                    cc.DelayTime.create(2),
                    cc.MoveTo.create(1, cc.p(-730, 0))
            ))
        }, 3);
        this.rootNode.scheduleOnce(function ()
        {
            cc.BuilderReader.runScene("", "MainLayer");
        }, 7);
    }
    else {
        cc.AudioEngine.getInstance().playEffect(PS_MAIN_SOUNDS.gameover);
        currentLevel = 1;
        currentLevelScore = 0;
        cc.Toast.create(this.rootNode, "lost", 2);
        this.rootNode.scheduleOnce(function ()
        {
            cc.BuilderReader.runScene("", "StartLayer");
        }, 2)
    }
    if (this.totalScore > this.bestScore) {
        sys.localStorage.setItem("starBestScore", this.totalScore + "");
    }
}

MainLayer.prototype.showScoreTip = function ()
{
    this.scoreTipLabel.setVisible(true);
    var length = this.sameColorList.length;
    var tip = length + " blocks " + length * length * 5 + " points";
    this.scoreTipLabel.setString(tip);
}


MainLayer.prototype.onTouchesBegan = function (touches, event)
{
    if (this.canTouch == false) {
        return;
    }

    var loc = touches[0].getLocation();
    this.ccTouchBeganPos = loc;
    for (var i = 0; i < this.starTable.length; i++) {
        // var sprites = this.starTable[i];
        for (var j = 0; j < this.starTable[i].length; j++) {
            // var pSprite0 = sprites[j];
            if (this.starTable[i][j] && this.starTable[i][j] != null) {
                //var ccRect = pSprite0.getBoundingBox();
                var ccRect = cc.rectCreate(this.starTable[i][j].getPosition(), [36, 36]);
                var pSprite0 = this.starTable[i][j];
                if (cc.rectContainsPoint(ccRect, this.ccTouchBeganPos)) {
                    if (this.sameColorList.length > 1) {
                        if (this.sameColorList.contains(pSprite0)) {
                            cc.AudioEngine.getInstance().playEffect(PS_MAIN_SOUNDS.broken, false);
                            this.removeSameColorStars();
                            this.scoreTipLabel.setVisible(false);
                        }
                        else {
                            for (var k = 0; k < this.sameColorList.length; k++) {
                                if (this.sameColorList[k]) {
                                    this.sameColorList[k].runAction(cc.ScaleTo.create(0.1, 1));
                                }
                            }
                            this.checkSameColorStars(pSprite0);
                            if (this.sameColorList.length > 1) {
                                cc.AudioEngine.getInstance().playEffect(PS_MAIN_SOUNDS.select, false);
                                this.showScoreTip();
                            }
                            else {
                                this.scoreTipLabel.setVisible(false);
                            }
                        }
                    }
                    else {
                        this.checkSameColorStars(pSprite0);
                        if (this.sameColorList.length > 1) {
                            cc.AudioEngine.getInstance().playEffect(PS_MAIN_SOUNDS.select, false);
                            this.showScoreTip();
                        }
                        else {
                            this.scoreTipLabel.setVisible(false);
                        }
                    }
                    break;
                }
            }
        }
    }
};


MainLayer.prototype.onTouchesMoved = function (touches, event)
{
}

MainLayer.prototype.onTouchesEnded = function (touches, event)
{
}



