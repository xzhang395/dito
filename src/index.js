import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
    CSS3DRenderer,
    CSS3DObject
} from 'three/examples/jsm/renderers/CSS3DRenderer.js';

import * as dat from 'dat.gui';
import data from './emotions.json';

let renderer = null,
    scene = null,
    camera = null,
    particles = null,
    callbacks = null,
    lastMouseX = null,
    lastMouseY = null,
    particleSystem = null,
    mouseDown = null,
    mesh = null,
    rotX = 0,
    rotY = 46.3,
    opac = 1,
    backgroundColor = "0x202020",
    object, geometry, guiElement, stats,
    DEPTH = 600, NEAR = 1, FAR = 4000, VIEW_ANGLE = 45;

let step = 0.04;
let linestep = 0.07;

let color = "ffffff";
let SCREEN_WIDTH, SCREEN_HEIGHT;

let para = {
    a1: 1,
    b1: 1,
    m1: 5,
    n11: 1,
    n21: 1,
    n31: 2,
    a2: 1,
    b2: 1,
    m2: 5,
    n12: 1,
    n22: 1,
    n32: 3,
    pSize: 1,
    presets: 'sphere',
};
let Mstep = {
    a1: 1,
    b1: 1,
    m1: 5,
    n11: 1,
    n21: 1,
    n31: 2,
    a2: 1,
    b2: 1,
    m2: 5,
    n12: 1,
    n22: 1,
    n32: 3
};
let end = {
    a1: 1,
    b1: 1,
    m1: 5,
    n11: 1,
    n21: 1,
    n31: 2,
    a2: 1,
    b2: 1,
    m2: 5,
    n12: 1,
    n22: 1,
    n32: 3
};
let prevform = para.presets;
let composer, hblur, vblur, material, effectVignette, focus;
let lightX = 0, lightY = 50, lightZ = 700, shadowBias = 0.002, shadowDarkness = 0.8, ambientLight,
    shadowCameraNear = 450;
let value;
let light;
let controls, morphtime = 20, morphstart = false, tick = 0;
let bloopStep = 60, bcount = 0, breathScale = 0.2, breathIn = bloopStep * 2 / 5, breathHold = bloopStep * 2 / 5, breathOut = bloopStep / 5;
let canvas;
let bgMaterial, bggeometry, planeMesh, cssObject, cssRenderer, cssScene;
let objects = [];
let layout;
let textdiv;

init();
animate();
//init
function init() {
    document.body.style.backgroundColor = "black";
    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;
    scene = new THREE.Scene();
    cssScene = new THREE.Scene();
    object = new meshObject(rotX, rotY);
    // object.getScene();
    // bgMaterial = new THREE.MeshBasicMaterial({ wireframe: true });
    // bggeometry = new THREE.PlaneGeometry(200, 200, 32, 32);

    // bgMaterial.color.set('white')
    // planeMesh = new THREE.Mesh(bggeometry, bgMaterial);
    // planeMesh.position.z = -100;
    // scene.add(planeMesh);
     addtext();
    setup();
    value = Object.values(para);
    controls = new OrbitControls(camera, renderer.domElement);
   
    cssRenderer = new CSS3DRenderer();
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = 0;

    document.getElementById('css').appendChild(cssRenderer.domElement).className = "domobjects";

    object.createMeshObject();
    object.createMeshMaterial();
    object.scene.geometry.vertices = geometry.vertices;
    object.scene.geometry.verticesNeedUpdate = true;

}

function addtext() {
    for (const property in data) {
        let array = data[property];
        for (let i = 0; i < array.length; i++) {
            let val = array[i];
            textdiv = document.createElement('div');
            // textdiv.style.backgroundColor = 'rgba(0,127,127,' + (Math.random() * 0.5 + 0.25) + ')';
            textdiv.innerHTML = val.word;
            textdiv.setAttribute('class', 'text');
            textdiv.setAttribute('data-emotion', property);
            textdiv.setAttribute('data-intensity', val.intensity);
            let cssobject = new CSS3DObject(textdiv);
            cssobject.position.x = Math.random() * 4000 - 2000;
            cssobject.position.y = Math.random() * 4000 - 2000;
            cssobject.position.z = -1000;
            cssScene.add(cssobject);
            objects.push(cssobject);

            //clipping plane
            let planematerial = new THREE.MeshPhongMaterial({
                opacity: 0.2,
                color: new THREE.Color('red'),
                blending: THREE.NoBlending,
                side: THREE.DoubleSide,
            });
            let planegeometry = new THREE.PlaneGeometry(500, 100);
            let planemesh = new THREE.Mesh(planegeometry, planematerial);
            planemesh.position.copy(cssobject.position);
            planemesh.rotation.copy(cssobject.rotation);
            //mesh.scale.copy( domObject.scale );
            planemesh.castShadow = false;
            planemesh.receiveShadow = true;
            scene.add(planemesh);
            //
            // let css3dobject = new THREE.Object3D();
            // css3dobject.position.x = (array[i + 3] * 140) - 1330;
            // css3dobject.position.y = - (array[i + 4] * 180) + 990;

            // var xy = getRandomPosition(textdiv);
            // textdiv.style.top = xy[0] + 'px';
            // textdiv.style.left = xy[1] + 'px';
            // document.getElementById( 'txtplane' ).appendChild(textdiv);
            // layout =   document.getElementById( 'txtplane' );
        }
    }
    //     let cssobject = new CSS3DObject(layout);
    //     // cssobject.position.x = -4000;
    //     // cssobject.position.y = -4000;
    //     cssobject.position.set(planeMesh.position);
    //     // cssobject.position.z = -100;
    // console.log(planeMesh.position.y)
    //     // cssobject.rotation.set(planeMesh.rotation);
    //     // cssobject.rotation.x=0;
    //     // cssobject.rotation.y=0;
    //     // cssobject.rotation.z=0;
    //     cssScene.add(cssobject);
    //     objects.push(cssobject);

}

// function addplane() {
//     let planematerial = new THREE.MeshPhongMaterial({
//         opacity: 0.2,
//         color: new THREE.Color('black'),
//         blending: THREE.NoBlending,
//         side: THREE.DoubleSide,
//     });
//     let planegeometry = new THREE.PlaneGeometry(100, 100);
//     let planemesh = new THREE.Mesh(planegeometry, planematerial);
//     planemesh.position.copy(domObject.position);
//     planemesh.rotation.copy(domObject.rotation);
//     //mesh.scale.copy( domObject.scale );
//     planemesh.castShadow = false;
//     planemesh.receiveShadow = true;
//     scene.add(planemesh);
// }

// function getRandomPosition(element) {
//     let x = document.body.offsetHeight - element.clientHeight;
//     let y = document.body.offsetWidth - element.clientWidth;
//     let randomX = Math.floor(Math.random() * x);
//     let randomY = Math.floor(Math.random() * y);
//     return [randomX, randomY];
// }
//setup
function setup() {
    //GUI setup
    const gui = new dat.GUI({
        load: JSON,
        preset: 'Flow'
    });
    let folder1 = gui.addFolder('first form');
    let folder2 = gui.addFolder('second form');
    let folder3 = gui.addFolder('preset shapes');
    folder1.add(para, 'a1', 0, 5);
    folder1.add(para, 'b1', 0, 5);
    folder1.add(para, 'm1', 0, 20);
    folder1.add(para, 'n11', 0, 100);
    folder1.add(para, 'n21', -50, 100);
    folder1.add(para, 'n31', -50, 100);

    folder2.add(para, 'a2', 0, 5);
    folder2.add(para, 'b2', 0, 5);
    folder2.add(para, 'm2', 0, 20);
    folder2.add(para, 'n12', 0, 100);
    folder2.add(para, 'n22', -50, 100);
    folder2.add(para, 'n32', -50, 100);

    folder3.add(para, 'presets', ['sphere', 'diamond', 'star', 'happy']);


    renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        premultipliedAlpha: false,

    });
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.setClearColor( 0x000000, 0 );
    document.querySelector('#webgl').appendChild( renderer.domElement );

    renderer.autoClear = true;

    // camera
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, SCREEN_WIDTH / SCREEN_HEIGHT, NEAR, FAR);
    camera.position.set(0, 0, DEPTH);
    camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    camera.updateProjectionMatrix();


    // LIGHTS
    ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambientLight);


    // LIGHTS
    light = new THREE.SpotLight(0xFFFFFF);
    light.castShadow = true;
    light.position.set(lightX, lightY, lightZ);
    light.target.position.set(0, 0, 0);
    light.shadow.camera.near = shadowCameraNear;
    light.shadow.camera.far = camera.far;

    light.shadow.bias = shadowBias;
    scene.add(light);
}

// Objects
function meshObject(b, a) {

    this.rotX = b;
    this.rotY = a;
    this.scene = new THREE.Object3D();
    this.getScene = function () {
        return this.scene
    };
    this.createMeshObject = function () {
        geometry = new THREE.Geometry();
        geometry.dynamic = true;
        step = 0.05;
        let q = parseInt(2 * Math.PI / step + 1.3462);
        let o = parseInt(Math.PI / step + 1.5);
        for (let l = 0; l < (q); l++) {
            let u = -Math.PI + l * step;
            for (let h = 0; h < (o); h++) {
                let s = -Math.PI / 2 + h * step;
                let m, k, n, g, v, e, t;
                let f = 0;
                let p = 0;
                let w = 0;
                m = Math.cos(para.m1 * u / 4);
                m = 1 / para.a1 * Math.abs(m);
                m = Math.abs(m);
                k = Math.sin(para.m1 * u / 4);
                k = 1 / para.b1 * Math.abs(k);
                k = Math.abs(k);
                g = Math.pow(m, para.n21) + Math.pow(k, para.n31);
                v = Math.abs(g);
                v = Math.pow(v, (-1 / para.n11));
                m = Math.cos(para.m2 * s / 4);
                m = 1 / para.a2 * Math.abs(m);
                m = Math.abs(m);
                k = Math.sin(para.m2 * s / 4);
                k = 1 / para.b2 * Math.abs(k);
                k = Math.abs(k);
                e = Math.pow(m, para.n22) + Math.pow(k, para.n32);
                t = Math.abs(e);
                t = Math.pow(t, (-1 / para.n12));
                f = v * Math.cos(u) * t * Math.cos(s) * 100;
                p = v * Math.sin(u) * t * Math.cos(s) * 100;
                w = t * Math.sin(s) * 100;
                geometry.vertices.push(new THREE.Vector3(f, p, w))
            }
        }
        for (let u = 0; u < (q - 1); u++) {
            for (let s = 0; s < (o - 1); s++) {
                let d = u * o + s;
                let c = u * o + s + 1;
                let b = (u + 1) * o + s + 1;
                let a = (u + 1) * o + s;
                geometry.faces.push(new THREE.Face3(d, c, b))
                geometry.faces.push(new THREE.Face3(d, b, a))
            }
        }
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
    };
    this.createMeshMaterial = function () {
        // console.log(savemesh);
        scene.children.pop();
        material = new THREE.MeshNormalMaterial();

        this.scene = new THREE.Mesh(geometry, material);

        material.side = THREE.DoubleSide;
        material.blending = THREE.NoBlending;
        this.scene.castShadow = true;
        this.scene.receiveShadow = true;

        scene.add(this.scene);
        this.scene.rotation.x = this.rotX;
        this.scene.rotation.y = this.rotY
    };
    this.update = function () {
        this.createMeshObject();
        this.scene.geometry.vertices = geometry.vertices;
        this.scene.geometry.verticesNeedUpdate = true
    };
}

function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}
function presetform(a1, b1, m1, n11, n21, n31, a2, b2, m2, n12, n22, n32) {
    para.a1 = a1;
    para.b1 = b1;
    para.m1 = m1;
    para.n11 = n11;
    para.n21 = n21;
    para.n31 = n31;
    para.a2 = a2;
    para.b2 = b2;
    para.m2 = m2;
    para.n12 = n12;
    para.n22 = n22;
    para.n32 = n32;
}
function morph(a1, b1, m1, n11, n21, n31, a2, b2, m2, n12, n22, n32) {
    end.a1 = a1;
    end.b1 = b1;
    end.m1 = m1;
    end.n11 = n11;
    end.n21 = n21;
    end.n31 = n31;
    end.a2 = a2;
    end.b2 = b2;
    end.m2 = m2;
    end.n12 = n12;
    end.n22 = n22;
    end.n32 = n32;
    morphstart = true;
    Mstep.a1 = (a1 - para.a1) / morphtime;
    Mstep.b1 = (b1 - para.b1) / morphtime;
    Mstep.m1 = (m1 - para.m1) / morphtime;
    Mstep.n11 = (n11 - para.n11) / morphtime;
    Mstep.n21 = (n21 - para.n21) / morphtime;
    Mstep.n31 = (n31 - para.n31) / morphtime;
    Mstep.a2 = (a2 - para.a2) / morphtime;
    Mstep.b2 = (b2 - para.b2) / morphtime;
    Mstep.m2 = (m2 - para.m2) / morphtime;
    Mstep.n12 = (n12 - para.n12) / morphtime;
    Mstep.n22 = (n22 - para.n22) / morphtime;
    Mstep.n32 = (n32 - para.n32) / morphtime;
}
function happy( ) {
    let Hn21 = Math.floor(Math.random() * 120) - 50;
    let Hn31 = Hn21;
    let Hn11 = Hn21 + 30;
    if (Hn11 < 10) { Hn11 = Math.floor(Math.random() * 10 + 10); } else if (Hn11 > 100) { Hn11 = 100; }
    let Hm1 = Math.floor(Math.random() * 5);
    let Hn22 = Math.floor(Math.random() * 120) - 50;
    let Hn32 = Hn21;
    let Hn12 = Hn22 + 30;
    let Hm2 = Math.floor(Math.random() * 10);
    if (Hn12 < 10) { Hn12 = Math.floor(Math.random() * 10 + 10); } else if (Hn12 > 100) { Hn12 = 100; }
    morph(1, 1, Hm1, Hn11, Hn21, Hn31, 1, 1, Hm2, Hn12, Hn22, Hn32);
}

//click 
let elements = document.getElementsByClassName("text");
let myFunction = function() {
    let emotion = this.getAttribute("data-emotion");
    let intensity = this.getAttribute("data-intensity");
    console.log(emotion,intensity);
    if (emotion == 'anger'){
        happy();
    }
    else if(emotion == 'anticipation'){
        happy();
    }
    else if(emotion == 'disgust'){
        happy();
    }
    else if(emotion == 'fear'){
        happy();
    }
    else if(emotion == 'joy'){
        happy();
    }
    else if(emotion == 'sadness'){
        happy();
    }
    else if(emotion == 'suprise'){
        happy();
    }
    else if(emotion == 'trust'){
        happy();
    }
};

for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener('click', myFunction, false);
}

//animate
function animate() {
    // console.log(scene.children);

    let change = arrayEquals(Object.values(para), value);

    requestAnimationFrame(animate);
    if (!change) {
        // renderer.clear();
        object.createMeshObject();
        object.createMeshMaterial();
        object.scene.geometry.vertices = geometry.vertices;
        object.scene.geometry.verticesNeedUpdate = true;
        value = Object.values(para);
    }
    if (prevform !== para.presets) {
        morphstart = true;
        if (para.presets == 'sphere') {
            morph(1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1);
        }
        else if (para.presets == 'diamond') {
            morph(1, 1, 4, 1, 1, 1, 1, 1, 4, 1, 1, 1);
        }
        else if (para.presets == 'star') {
            morph(1, 1, 5, 0.1, 1.7, 1.7, 1, 1, 1, 0.3, 0.5, 0.5);
        }
        else if (para.presets == 'happy') {
            happy();
        }
        prevform = para.presets;
    }
    if (morphstart) {
        para.a1 += Mstep.a1;
        para.b1 += Mstep.b1;
        para.m1 += Mstep.m1;
        para.n11 += Mstep.n11;
        para.n21 += Mstep.n21;
        para.n31 += Mstep.n31;
        para.a2 += Mstep.a2;
        para.b2 += Mstep.b2;
        para.m2 += Mstep.m2;
        para.n12 += Mstep.n12;
        para.n22 += Mstep.n22;
        para.n32 += Mstep.n32;
        tick += 1;
    }
    if (tick == morphtime) {
        morphstart = false;
        tick = 0;
    }
    if (bcount <= breathIn) {
        let instep = breathScale / breathIn
        para.n11 += instep;
        para.n21 += instep;
        para.n31 += instep;
        para.n12 += instep;
        para.n22 += instep;
        para.n32 += instep;
        bcount++;

    } else if (bcount <= breathIn + breathHold) {
        bcount++;
    } else if (bcount <= bloopStep) {
        let outstep = breathScale / breathOut
        para.n11 -= outstep;
        para.n21 -= outstep;
        para.n31 -= outstep;
        para.n12 -= outstep;
        para.n22 -= outstep;
        para.n32 -= outstep;
        bcount++;
    }
    else if (bcount > bloopStep) {
        bcount = 0
    }
    renderer.render(scene, camera);
    // console.log(cssScene.children);
    cssRenderer.render(cssScene, camera);
}
