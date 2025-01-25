// 初始化内容
var wH = window.innerHeight;
var wW = window.innerWidth;
let backgroundRendering = document.getElementById("backgroundRendering");
var generateStars = function generateStars(f) {
    for (var e = 0; e < f; e++) {
        var single = document.createElement("div");
        single.className = e % 20 == 0 ? "spark big-spark" : e % 9 == 0 ? "spark medium-spark" : "star";
        single.setAttribute("style", "top:" + Math.round(Math.random() * wH) + "px;left:" + Math.round(Math.random() * wW) + "px;animation-duration:" + (Math.round(Math.random() * 3000) + 3000) + "ms;animation-delay:" + Math.round(Math.random() * 3000) + "ms;");
        backgroundRendering.appendChild(single);
    }
};
generateStars(getRandom(140, 240));


// 全局变量 提供内容/对象存储
let fireworksCanvas = document.getElementById("fireworks");
let currentFireworks = document.createElement("canvas");
let currentObject = currentFireworks.getContext("2d");
let fireworksObject = fireworksCanvas.getContext("2d");

currentFireworks.width = fireworksCanvas.width = window.innerWidth;
currentFireworks.height = fireworksCanvas.height = window.innerHeight;
let fireworksExplosion = [];
let autoPlayFlag = false;

// 自动加载烟花动画
window.onload = function () {
    drawFireworks();
    lastTime = new Date();
    animationEffect();
    // 背景音乐
    let audio = document.getElementById('bgm');
    let clickCount = 0;

    document.querySelector("body").onclick = function () {
        if (!autoPlayFlag) {
            audio.play();
            autoPlayFlag = true;
        }

        if (clickCount === 0) {
            // 第一个文本逐渐消失
            for (let i = 0; i <= 10; i++) {
                setTimeout(function () {
                    document.querySelector("body > div.message").style.opacity = 1 - i / 10;
                    if (i == 10) {
                        document.querySelector("body > div.message > p").innerHTML = "点击屏幕可快速释放烟花";
                        // 第二个文本逐渐出现
                        for (let j = 0; j <= 10; j++) {
                            setTimeout(function () {
                                document.querySelector("body > div.message").style.opacity = j / 10;
                            }, j * 60);
                        }
                    }
                }, i * 60);
            }
        } else if (clickCount === 1) {
            // 第二个文本逐渐消失
            for (let i = 0; i <= 10; i++) {
                setTimeout(function () {
                    document.querySelector("body > div.message").style.opacity = 1 - i / 10;
                }, i * 60);
            }
        }

        clickCount++;
    }

    // 初始显示文本
    for (let i = 0; i <= 10; i++) {
        setTimeout(function () {
            document.querySelector("body > div.message").style.opacity = i / 10;
        }, i * 60 + 2000);
    }
};

let lastTime;


// 烟花动画效果
function animationEffect() {
    fireworksObject.save();
    fireworksObject.fillStyle = "rgba(0,5,25,0.1)";
    fireworksObject.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
    fireworksObject.restore();
    let newTime = new Date();
    if (newTime - lastTime > getRandom(10, 1600) + (window.innerHeight - 767) / 2) {
        let random = Math.random() * 100 > 15;
        let x = getRandom(0, (fireworksCanvas.width));
        let y = getRandom(0, 400);
        if (random) {
            let bigExplode = new explode(
                getRandom(0, fireworksCanvas.width),
                getRandom(1, 3),
                "#FFF",
                {
                    x: x,
                    y: y,
                }
            );
            fireworksExplosion.push(bigExplode);

        } else {
            let x = getRandom(fireworksCanvas.width / 2 - 300, fireworksCanvas.width / 2 + 300);
            let y = getRandom(0, 350);
            let bigExplode = new explode(
                getRandom(0, fireworksCanvas.width),
                getRandom(1, 3),
                "#FFF",
                {
                    x: x,
                    y: y,
                },
                document.querySelectorAll(".shape")[
                parseInt(getRandom(0, document.querySelectorAll(".shape").length))
                ]
            );
            fireworksExplosion.push(bigExplode);
        }
        lastTime = newTime;
    }
    sparks.foreach(function () {
        this.paint();
    });
    fireworksExplosion.foreach(function () {
        let that = this;
        if (!this.dead) {
            this._move();
            this._drawLight();
        } else {
            this.explodes.foreach(function (index) {
                if (!this.dead) {
                    this.moveTo();
                } else {
                    if (index === that.explodes.length - 1) {
                        fireworksExplosion[fireworksExplosion.indexOf(that)] = null;
                    }
                }
            });
        }
    });
    setTimeout(animationEffect, 16);
}

Array.prototype.foreach = function (callback) {
    for (let i = 0; i < this.length; i++) {
        if (this[i] !== null) {
            callback.apply(this[i], [i]);
        }
    }
};

fireworksCanvas.onclick = function (evt) {
    let x = evt.clientX;
    let y = evt.clientY;
    let explode1 = new explode(
        getRandom(fireworksCanvas.width / 3, (fireworksCanvas.width * 2) / 3),
        2,
        "#FFF",
        {
            x: x,
            y: y,
        }
    );
    fireworksExplosion.push(explode1);
};

let explode = function (x, r, c, explodeArea, shape) {
    this.explodes = [];
    this.x = x;
    this.y = fireworksCanvas.height + r;
    this.r = r;
    this.c = c;
    this.shape = shape || false;
    this.explodeArea = explodeArea;
    this.dead = false;
    this.ba = parseInt(getRandom(80, 200));
};
explode.prototype = {
    _paint: function () {
        fireworksObject.save();
        fireworksObject.beginPath();
        fireworksObject.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        fireworksObject.fillStyle = this.c;
        fireworksObject.fill();
        fireworksObject.restore();
    },
    _move: function () {
        let dx = this.explodeArea.x - this.x,
            dy = this.explodeArea.y - this.y;
        this.x = this.x + dx * 0.01;
        this.y = this.y + dy * 0.01;
        if (Math.abs(dx) <= this.ba && Math.abs(dy) <= this.ba) {
            if (this.shape) {
                this._shapeExplode();
            } else {
                this._explode();
            }
            this.dead = true;
        } else {
            this._paint();
        }
    },
    _drawLight: function () {
        fireworksObject.save();
        fireworksObject.fillStyle = "rgba(255,228,150,0.3)";
        fireworksObject.beginPath();
        fireworksObject.arc(this.x, this.y, this.r + 3 * Math.random() + 1, 0, 2 * Math.PI);
        fireworksObject.fill();
        fireworksObject.restore();
    },
    _explode: function () {
        let embellishmentNum = getRandom(30, 200);
        let style = getRandom(0, 10) >= 5 ? 1 : 2;
        let color;
        if (style === 1) {
            color = {
                a: parseInt(getRandom(128, 255)),
                b: parseInt(getRandom(128, 255)),
                c: parseInt(getRandom(128, 255)),
            };
        }
        let fullRange = parseInt(getRandom(300, 400));
        for (let i = 0; i < embellishmentNum; i++) {
            if (style === 2) {
                color = {
                    a: parseInt(getRandom(128, 255)),
                    b: parseInt(getRandom(128, 255)),
                    c: parseInt(getRandom(128, 255)),
                };
            }
            let a = getRandom(-Math.PI, Math.PI);
            let x = getRandom(0, fullRange) * Math.cos(a) + this.x;
            let y = getRandom(0, fullRange) * Math.sin(a) + this.y;
            let radius = getRandom(0, 2);
            let embellishment = new newEmbellishment(this.x, this.y, radius, color, x, y);
            this.explodes.push(embellishment);
        }
    },
    _shapeExplode: function () {
        let that = this;
        putValue(currentFireworks, currentObject, this.shape, 5, function (dots) {
            let dx = fireworksCanvas.width / 2 - that.x;
            let dy = fireworksCanvas.height / 2 - that.y;
            let color;
            for (let i = 0; i < dots.length; i++) {
                color = {
                    a: dots[i].a,
                    b: dots[i].b,
                    c: dots[i].c,
                };
                let x = dots[i].x;
                let y = dots[i].y;
                let radius = 1;
                let embellishment = new newEmbellishment(that.x, that.y, radius, color, x - dx, y - dy);
                that.explodes.push(embellishment);
            }
        });
    },
};

function putValue(fireworks, context, ele, dr, callback) {
    context.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
    let img = new Image();
    let dots;
    if (ele.innerHTML.indexOf("img") >= 0) {
        img.src = ele.getElementsByTagName("img")[0].src;
        implode(img, function () {
            context.drawImage(
                img,
                fireworksCanvas.width / 2 - img.width / 2,
                fireworksCanvas.height / 2 - img.width / 2
            );
            let dots = gettingData(fireworks, context, dr);
            callback(dots);
        });
    } else {
        let text = ele.innerHTML;
        context.save();
        let fontSize = getRandom(3, 11);
        context.font = fontSize + "vw 宋体 bold";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle =
            "rgba(" +
            parseInt(getRandom(128, 255)) +
            "," +
            parseInt(getRandom(128, 255)) +
            "," +
            parseInt(getRandom(128, 255)) +
            " , 1)";
        context.fillText(text, fireworksCanvas.width / 2, fireworksCanvas.height / 2);
        context.restore();
        dots = gettingData(fireworks, context, dr);
        callback(dots);
    }
}

function implode(img, callback) {
    if (img.complete) {
        callback.call(img);
    } else {
        img.onload = function () {
            callback.call(this);
        };
    }
}

function gettingData(fireworks, context, dr) {
    let imgData = context.getImageData(0, 0, fireworksCanvas.width, fireworksCanvas.height);
    context.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
    let dots = [];
    for (let x = 0; x < imgData.width; x += dr) {
        for (let y = 0; y < imgData.height; y += dr) {
            let i = (y * imgData.width + x) * 4;
            if (imgData.data[i + 3] > 128) {
                let dot = {
                    x: x,
                    y: y,
                    a: imgData.data[i],
                    b: imgData.data[i + 1],
                    c: imgData.data[i + 2],
                };
                dots.push(dot);
            }
        }
    }
    return dots;
}

function getRandom(a, b) {
    return Math.random() * (b - a) + a;
}

let maxRadius = 1,
    sparks = [];

function drawFireworks() {
    for (let i = 0; i < 100; i++) {
        let spark = new newSpark();
        sparks.push(spark);
        spark.paint();
    }
}

// 新建星火位置
let newSpark = function () {
    this.x = Math.random() * fireworksCanvas.width;

    this.y = Math.random() * 2 * fireworksCanvas.height - fireworksCanvas.height;

    this.r = Math.random() * maxRadius;

};

newSpark.prototype = {
    paint: function () {
        fireworksObject.save();
        fireworksObject.beginPath();
        fireworksObject.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        fireworksObject.fillStyle = "rgba(255,255,255," + this.r + ")";
        fireworksObject.fill();
        fireworksObject.restore();
    },
};
// 烟花点缀生成
let newEmbellishment = function (centerX, centerY, radius, color, tx, ty) {
    this.tx = tx;
    this.ty = ty;
    this.x = centerX;
    this.y = centerY;
    this.dead = false;
    this.radius = radius;
    this.color = color;
};
newEmbellishment.prototype = {
    paint: function () {
        fireworksObject.save();
        fireworksObject.beginPath();
        fireworksObject.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        fireworksObject.fillStyle =
            "rgba(" + this.color.a + "," + this.color.b + "," + this.color.c + ",1)";
        fireworksObject.fill();
        fireworksObject.restore();
    },
    moveTo: function () {
        this.ty = this.ty + 0.3;
        let dx = this.tx - this.x,
            dy = this.ty - this.y;
        this.x = Math.abs(dx) < 0.1 ? this.tx : this.x + dx * 0.1;
        this.y = Math.abs(dy) < 0.1 ? this.ty : this.y + dy * 0.1;
        if (dx === 0 && Math.abs(dy) <= 80) {
            this.dead = true;
        }
        this.paint();
    },
};

// ========== 可拖拽 & 自动旋转 & 支持触摸的 3D 立方体逻辑 ==========
(function() {
    const cube = document.getElementById('cube');
    if (!cube) return;

    // 是否处于自动旋转、是否正在拖拽
    let autoRotate = true;
    let isDragging = false;

    // 当前立方体旋转角度(绕 X, Y 轴)
    // 与CSS初始 transform: rotateX(-30deg) rotateY(0deg) 对应
    let angleX = -30;
    let angleY = 0;

    // 用来记录用户按下拖拽时的鼠标起始点和立方体角度
    let startX = 0, startY = 0;      // 鼠标/手指起始位置
    let baseAngleX = angleX, baseAngleY = angleY;  // 拖拽开始前的立方体角度

    // 1. 初次让立方体以该角度显示
    cube.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg)`;

    // 2. 自动旋转动画：在未拖拽时，让angleY不断变化
    function animateCube() {
        if (autoRotate && !isDragging) {
        // 逆时针：每帧减少一些angleY
        angleY -= 0.3; 
        // 重新设置立方体transform
        cube.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg)`;
        }
        requestAnimationFrame(animateCube);
    }
    animateCube();

    // 3. 拖拽/触摸事件
    // 为了兼容触摸与鼠标，先写一个获取坐标的函数
    function getEventPosition(e) {
        if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else {
        return { x: e.clientX, y: e.clientY };
        }
    }

    // 开始拖拽
    function startDrag(e) {
        e.preventDefault();
        autoRotate = false; // 用户一旦拖拽，就关闭自动旋转
        isDragging = true;
        cube.style.cursor = 'grabbing';

        const pos = getEventPosition(e);
        // 记录下拖拽开始时的坐标
        startX = pos.x;
        startY = pos.y;
        // 记录下当前的角度，作为“基准”
        baseAngleX = angleX;
        baseAngleY = angleY;

        // 播放背景音乐
        let audio = document.getElementById('bgm');
        audio.play();
    }

    // 拖拽中
    function onDrag(e) {
        if (!isDragging) return;
        e.preventDefault();
        const pos = getEventPosition(e);

        // 计算鼠标/手指移动了多少
        const dx = pos.x - startX;
        const dy = pos.y - startY;

        // 将 dx, dy 映射为对angleX, angleY的增减
        // 你可以自行微调0.3为其他值来改变旋转灵敏度
        angleX = baseAngleX - dy * 0.3; // 往上拉时，dy为负，所以angleX会增加
        angleY = baseAngleY + dx * 0.3; // 往右拉时，dx为正，所以angleY会增加

        // 应用到立方体
        cube.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg)`;
    }

    // 结束拖拽
    function endDrag() {
        if (isDragging) {
        isDragging = false;
        cube.style.cursor = 'grab';
        // 不恢复 autoRotate，这样用户松开后立方体停留在最后拖拽的姿态
        }
    }

    // 4. 监听鼠标事件
    cube.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);

    // 5. 监听触摸事件（移动端）
    cube.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('touchend', endDrag, { passive: false });
})();  

// ========== 点击魔方跳转到Github ==========
document.addEventListener('DOMContentLoaded', function() {
  var link = document.querySelector('.face-bottom a');
  link.addEventListener('touchstart', function() {
    window.location.href = link.href;
  });
});