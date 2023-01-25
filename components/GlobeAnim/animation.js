import gsap from 'gsap'
import * as THREE from 'three'


import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import GUI from 'lil-gui';
import Stats from 'stats.js'
import { profilesData } from "../ProfilesPlate/profiles"


export const mainAnim = function (idContainer, callback) {
  if (document.querySelector(idContainer).children.length != 0) return 0;


  const debugMode = window.location.href.split("#")[1] == "debug" ? true : false;

  const stats = new Stats()
  const gui = new GUI();
  gui.hide()

  const pointParams = {
    colorBg: "#1a1fb7",
  }
  let profileFolder = gui.addFolder("Profile")
  profileFolder.addColor(pointParams, "colorBg").listen()

  /**
   * debug mode
   */
  if (debugMode) {
    stats.showPanel(0)
    document.body.appendChild(stats.dom)
    gui.show()

  }

  const manager = new THREE.LoadingManager();
  manager.onError = function (url) {
    console.log('There was an error loading ' + url);
  };


  // const clock = new THREE.Clock()
  // const cameraCenter = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2)
  // const cameraLimit = new THREE.Vector2(3, 3);

  let camera, scene, renderer, controls;
  let fov = 50, planeAspectRatio = 9 / 9, counter = 0;
  const loader = new GLTFLoader(manager);
  const textureLoader = new THREE.TextureLoader(manager);
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(1, 1);
  const container = document.querySelector(idContainer)
  const modelFolderUrl = container.getAttribute("data-model")
  let activePoint = null



  init()

  function init() {

    scene = new THREE.Scene();

    /**
     * camera
     */

    camera = new THREE.PerspectiveCamera(fov, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    camera.position.set(0, 0, 3)



    /**
     * lights
     */
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xcccccc, 8.94);
    hemiLight.intensity = 1
    scene.add(hemiLight);

    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.intensity = 600
    spotLight.angle = 0.45
    spotLight.distance = 100
    spotLight.position.set(0, 2, 20);
    scene.add(spotLight);
    // const spotLightHelper = new THREE.SpotLightHelper(spotLight);
    // scene.add(spotLightHelper);


    /**
     * renderer
     */

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio * 1);
    renderer.setSize(container.offsetWidth, container.offsetHeight);

    renderer.physicallyCorrectLights = true;
    container.appendChild(renderer.domElement);
    controls = new OrbitControls(camera, container);
    controls.enablePan = false
    controls.minPolarAngle = toRad(60)
    controls.maxPolarAngle = toRad(110)
    controls.minDistance = 2
    controls.maxDistance = 10
    controls.update();
    // controls.enabled = false


    // scene.add(new THREE.AxesHelper(5));



    /**
     * earth
     */
    const earthTexture = textureLoader.load(modelFolderUrl + "earth_no_clouds.jpg")
    const earthTextureBump = textureLoader.load(modelFolderUrl + "earth_bump_map.jpeg")
    const cloudsTexture = textureLoader.load(modelFolderUrl + "clouds.jpg")
    const atmosphraTexture = textureLoader.load(modelFolderUrl + "atmosphera.png")
    const starTexture = textureLoader.load(modelFolderUrl + "atmosphera.jpg")
    const dotTexture = textureLoader.load(modelFolderUrl + "point.png")

    // earthTexture.offset = new THREE.Vector2(0.24, 0.0)
    // earthTexture.rotation = toRad(50)
    const earthGroupAll = new THREE.Group()
    // earthGroupAll.add(new THREE.AxesHelper(2));

    const earthGroup = new THREE.Group()
    // earthGroup.add(new THREE.AxesHelper(2));
    earthGroupAll.add(earthGroup)
    scene.add(earthGroupAll)
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(1, 300, 300),
      new THREE.MeshStandardMaterial({
        map: earthTexture,
        bumpMap: earthTextureBump,
        bumpScale: 0.04,
        // wireframe: true,
        // transparent: true,
        // opacity: 0.1,
      }),
    )
    earth.name = "earth";
    earth.rotateY(toRad(-90))
    earthGroup.add(earth)

    /**
     * clouds
     */
    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(1.001, 120, 120),
      new THREE.MeshStandardMaterial({
        map: cloudsTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        // alphaTest: 0.9,
        // depthTest: false,
        // depthWrite: false,
        side: THREE.FrontSide,
      }),
    )
    clouds.name = "clouds";
    // clouds.material.userData.u_time = { type: "f", value: 0 }
    // clouds.material.onBeforeCompile = shader => {
    //   shader.uniforms.u_time = clouds.material.userData.u_time;
    //   shader.vertexShader = `
    //         uniform float u_time;
    //       ` + shader.vertexShader
    //   shader.vertexShader =
    //     shader.vertexShader.replace(
    //       '#include <fog_vertex>',
    //       `
    //        #include <fog_vertex>
    //         gl_Position.y = gl_Position.y + sin(u_time * 0.0) * 0.1;
    //       `,
    //     )
    // }
    earthGroupAll.add(clouds)

    /**
     * atmosphera
     */
    const atmospheraGeometry = new THREE.BufferGeometry()
    atmospheraGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3))

    const atmosphera = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 2.5, 1, 1),
      new THREE.MeshBasicMaterial({
        color: "blue",
        map: atmosphraTexture,
        transparent: true,
        // sizeAttenuation: true,
        // size: 1,

        // opacity: 0.4,
        // blending: THREE.AdditiveBlending,
        // side: THREE.BackSide,
        // alphaTest: 0.9,
        // depthTest: false,
        depthWrite: false,
      }),
    )
    atmosphera.name = "atmosphera";
    scene.add(atmosphera)

    /**
     * stars
     */

    const particlesCount = 5000;
    const particlesPosArr = new Float32Array(particlesCount * 3)
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesMaterial = new THREE.PointsMaterial()
    // particlesMaterial.vertexColors = true
    // particlesMaterial.lights = true
    particlesMaterial.map = starTexture
    particlesMaterial.sizeAttenuation = true
    particlesMaterial.transparent = true
    particlesMaterial.alphaTest = 0.9
    // particlesMaterial.depthTest = false
    // particlesMaterial.depthWrite = false
    particlesMaterial.blending = THREE.AdditiveBlending

    let randomDistanse = [0, 1000]
    for (let i = 0; i < particlesCount * 3; i++) {
      particlesPosArr[i] = gsap.utils.random(randomDistanse[0], randomDistanse[1], 1) * gsap.utils.random([-1, 1])
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPosArr, 3))
    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)


    /**
       * add points for city
       */
    const cityPointGeometry = new THREE.PlaneGeometry(0.03, 0.03, 1, 1)
    const cityPointMaterial = new THREE.MeshBasicMaterial({
      color: "white",
      map: dotTexture,
      transparent: true,
      alphaTest: 0.1,

    })

    // console.log(profilesData);
    const groupCityAll = new THREE.Group()
    earthGroup.add(groupCityAll)
    profilesData.forEach((elem, index) => {
      const groupCity = new THREE.Group()
      groupCity.name = elem.cityLabel + "_group"
      const cityPoint = new THREE.Mesh(
        cityPointGeometry.clone(),
        cityPointMaterial.clone()
      )
      cityPoint.name = elem.cityLabel + "_point"
      cityPoint.userData.hover = false
      cityPoint.userData.click = false
      cityPoint.userData.profileIndex = index
      cityPoint.userData.hoverColor = new THREE.Color(elem.bgColor)
      cityPoint.position.set(0, 0, 1.02)
      groupCity.add(cityPoint)
      groupCity.rotateY(toRad(elem.cityCoorditates.y))
      groupCity.rotateX(-toRad(elem.cityCoorditates.x))
      groupCityAll.add(groupCity)
    })



    /**
     * animation
     */
    let mainAnim = [
      gsap.to(earthGroup.rotation, { duration: 120, y: toRad(360), ease: "none", repeat: -1 }),
      gsap.to(clouds.rotation, { duration: 100, y: toRad(360), ease: "none", repeat: -1 })
    ]


    function changeParamsFunc() {

    }
    gui.onChange(() => {
      changeParamsFunc()
    })

    onWindowResize()
    window.addEventListener('resize', onWindowResize, false)
    window.addEventListener('mousemove', function (e) {
      hoverPoinsFunc()
      onMouseMove(e)
    }, false)
    clickOpenProfile()
    clickCloseProfile()

    tick()
    callback(scene);





    /**
     * functions
     */
    let arrowV1 = null
    let arrowV2 = null
    function clickOpenProfile() {
      container.addEventListener("click", function () {
        const hoverObject = getMeshByUserDataValue(groupCityAll, "hover", true)
        if (hoverObject.length != 0 && hoverObject[0].userData.click == false && !document.body.classList.contains("profileOpen")) {
          document.body.classList.add("profileOpen")

          const object = hoverObject[0]
          activePoint = object
          object.userData.click = true
          scene.remove(arrowV1, arrowV2)

          const pointPos = new THREE.Vector3()
          const v1 = new THREE.Vector3()
          object.getWorldPosition(pointPos)
          v1.subVectors(pointPos, new THREE.Vector3()).normalize();

          // arrowV1 = new THREE.ArrowHelper(v1, new THREE.Vector3(0, 0, 0), 1.4, "yellow");
          // scene.add(arrowV1);

          const cameraPos = new THREE.Vector3()
          const v2 = new THREE.Vector3()
          camera.getWorldPosition(cameraPos)
          v2.subVectors(cameraPos, new THREE.Vector3()).normalize();
          // arrowV2 = new THREE.ArrowHelper(v2, new THREE.Vector3(0, 0, 0), 1.4, "blue");
          // scene.add(arrowV2);


          controls.minDistance = 1
          controls.maxDistance = 10
          controls.minPolarAngle = toRad(0)
          controls.maxPolarAngle = toRad(360)
          controls.enabled = false;
          let cameraDistance = cameraPos.distanceTo(new THREE.Vector3())
          let param = {
            stPos: new THREE.Vector3().copy(camera.position),
            endPos: v1.clone().multiplyScalar(cameraDistance),
            progress: 0.01,
            zoomDist: 1.5
          }


          var dir = param.endPos.clone().sub(param.stPos);
          var length = dir.length();
          let pointsArr = []
          pointsArr.push(param.stPos,)
          for (let i = 0; i < 10; i++) {
            const tempDir = dir.clone().normalize().multiplyScalar(length * i / 10);
            const tempPoint = param.stPos.clone().add(tempDir).normalize().multiplyScalar(cameraDistance);
            pointsArr.push(tempPoint)
          }
          // pointsArr.push(param.endPos)
          pointsArr.push(v1.clone().multiplyScalar(1.5))


          let curveLine = new THREE.CatmullRomCurve3(pointsArr)
          // // test line
          // const geometryLine = new THREE.TubeGeometry(curveLine, 100, 0.01, 6, false);
          // const materialLine = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
          // const meshLine = new THREE.Mesh(geometryLine, materialLine);
          // scene.add(meshLine);
          const profileBg = document.querySelector(`.profile--${object.userData.profileIndex} .profile__conainer`)
          pointParams.colorBg = window.getComputedStyle(profileBg).backgroundColor
          // profileFolder.color.onChange(() => {
          //   profileBg.setAttribute("background", pointParams.color)
          // })
          gui.onChange(event => {
            console.log(event);
            if (event.property == "colorBg") {
              console.log(`'${event.value}'`, profileBg);
              profileBg.style.background = event.value
            }
            // event.object     // object that was modified
            // event.property   // string, name of property
            // event.value      // new value of controller
            // event.controller // controller that was modified
          });

          gsap.timeline()
            .to(param, {
              duration: 1 * (1 + length / 10),
              progress: 0.98,
              ease: "none",
              onUpdate: () => {
                camera.position.copy(curveLine.getPointAt(param.progress))
              }
            })
            .to(".profiles", { duration: 1, autoAlpha: 1, ease: "sine.out" }, ">-0.1")
            .to(`.profile--${object.userData.profileIndex}`, { duration: 1, autoAlpha: 1, ease: "sine.out" }, "<")
            .to(`.profile--${object.userData.profileIndex}`, { duration: 1, scale: 1, ease: "back.out(1)" }, "<")
        }
      })
    }

    function clickCloseProfile() {
      document.querySelector(".profiles__close").addEventListener("click", function () {
        const cameraPos = new THREE.Vector3()
        const v2 = new THREE.Vector3()
        camera.getWorldPosition(cameraPos)
        v2.subVectors(cameraPos, new THREE.Vector3()).normalize();
        // var length = dir.length();
        let pointsArr = [
          cameraPos.clone(),
          v2.clone().multiplyScalar(3),
        ]
        let curveLine = new THREE.CatmullRomCurve3(pointsArr)
        let length = pointsArr[0].distanceTo(pointsArr[1])
        let param = {
          progress: 0.01,
        }

        gsap.timeline()
          .call(() => {
            activePoint.userData.hover = false
            activePoint.userData.click = false
          })
          .to(".profiles", { duration: 1, autoAlpha: 0, ease: "sine.in" })
          .to(`.profile`, { duration: 1, autoAlpha: 0, ease: "sine.in" }, "<")
          .to(`.profile`, { duration: 1, scale: 0, ease: "back.in(1)" }, "<")
          .to(param, {
            duration: 1 * (1 + length / 10),
            progress: 1,
            ease: "none",
            onUpdate: () => {
              camera.position.copy(curveLine.getPointAt(param.progress))
            }
          }, ">-0.2")
          .to(controls, { duration: 1, minPolarAngle: toRad(60), maxPolarAngle: toRad(110), minDistance: 2, maxDistance: 10, ease: "sine.inOut", onUpdate: () => { controls.update(); } }, "<")
          .call(() => {
            document.body.classList.remove("profileOpen")
          })

        mainAnim.forEach(elem => {
          gsap.to(elem, { duration: 0.2, timeScale: 1, ease: "sine.out" })
        })

      })

    }
    // function angleBetween(ob1,ob2){
    //   re
    // }

    function hoverPoinsFunc() {
      raycaster.setFromCamera(mouse, camera);
      let intersection = raycaster.intersectObjects(groupCityAll.children);

      if (intersection != 0 && intersection[0].object.userData.hover == false && !document.body.classList.contains("profileOpen")) {
        let elemAnim = intersection[0].object
        let tempHoverColor = elemAnim.userData.hoverColor
        elemAnim.userData.hover = true

        gsap.to(elemAnim.scale, { duration: 0.2, x: 1.5, y: 1.5, z: 1.5, ease: "sine.inOut" })
        gsap.to(elemAnim.material.color, { duration: 0.2, r: tempHoverColor.r, g: tempHoverColor.g, b: tempHoverColor.b, ease: "sine.inOut" })
        // mainAnim.forEach(elem => {
        //   // elem.pause()
        //   gsap.to(elem, { duration: 0.2, timeScale: 0, ease: "sine.out" })
        // })
        gsap.to(mainAnim[0], { duration: 0.2, timeScale: 0, ease: "sine.out" })
        gsap.to(mainAnim[1], { duration: 0.2, timeScale: 0.05, ease: "sine.out" })
        const tempPos = new THREE.Vector3()
        elemAnim.getWorldPosition(tempPos)
        controls.enabled = false;


      }
      if (intersection == 0 && getMeshByUserDataValue(groupCityAll, "click", true).length == 0) {
        controls.enabled = true;
        groupCityAll.children.forEach(elem => {
          let elemAnim = elem.children[0]
          elemAnim.userData.hover = false
          gsap.to(elemAnim.scale, { duration: 0.2, x: 1, y: 1, z: 1, ease: "sine.inOut" })
          gsap.to(elemAnim.material.color, { duration: 0.2, r: 1, g: 1, b: 1, ease: "sine.inOut" })
          mainAnim.forEach(elem => {
            gsap.to(elem, { duration: 0.2, timeScale: 1, ease: "sine.out" })
          })

        })


      }

    }

    function onWindowResize() {
      const width = container.offsetWidth;
      const height = container.offsetHeight;

      camera.aspect = width / height;

      if (camera.aspect > planeAspectRatio) {
        camera.fov = fov;
      } else {
        const cameraHeight = Math.tan(THREE.MathUtils.degToRad(fov / 2));
        const ratio = camera.aspect / planeAspectRatio;
        const newCameraHeight = cameraHeight / ratio;
        camera.fov = THREE.MathUtils.radToDeg(Math.atan(newCameraHeight)) * 2;
      }

      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      // if (composer) composer.setSize(width, height);
      renderer.setPixelRatio((window.mobile) ? window.devicePixelRatio * 0.35 : window.devicePixelRatio);

      /**
       * change camera target position 
       */
      // if (window.innerWidth < 1650) {
      //   let koff = (window.innerWidth - 320) / (1650 - 320)
      //   cameraTarget.x = 18 * koff
      // }


    }



    // function updateCamera() {
    //   //offset the camera x/y based on the mouse's position in the window
    //   camera.position.x = THREE.MathUtils.lerp(camera.position.x, cameraCenter.x + (cameraLimit.x * mouse.x), 0.05)
    //   camera.position.y = THREE.MathUtils.lerp(camera.position.y, cameraCenter.y + (cameraLimit.y * mouse.y), 0.05)
    // }
    const getMeshByUserDataValue = (scene, name, value) => {
      const meshes = [];

      scene.traverse((node) => {
        if (node.userData[name] === value) {
          meshes.push(node);
        }
      });

      return meshes;
    };

    function toRad(deg) {
      return deg * (Math.PI / 180);
    }

    function compareVectors3(v1, v2, distance) {
      let tempDist = {
        x: Math.abs(v1.x - v2.x),
        y: Math.abs(v1.y - v2.y),
        z: Math.abs(v1.z - v2.z),

      }
      let dxy = Math.sqrt((Math.pow(tempDist.x, 2) + Math.pow(tempDist.y, 2)), 2)
      let dyz = Math.sqrt((Math.pow(tempDist.y, 2) + Math.pow(tempDist.z, 2)), 2)
      let dxz = Math.sqrt((Math.pow(tempDist.x, 2) + Math.pow(tempDist.z, 2)), 2)

      dxy = (dxy + dyz + dxz) / 3
      dxy = (dxy < distance) ? (1 - dxy / distance) : false;
      return dxy;
    }
    function onMouseMove(event) {

      // event.preventDefault();
      mouse.x = ((event.clientX - container.getBoundingClientRect().x) / container.getBoundingClientRect().width) * 2 - 1;
      mouse.y = -((event.clientY - container.getBoundingClientRect().y) / container.getBoundingClientRect().height) * 2 + 1;
    }

    /**
     * tick animation
     */


    function tick() {
      atmosphera.lookAt(camera.position)
      if (clouds.material.userData.u_time)
        clouds.material.userData.u_time.value++
      groupCityAll.children.forEach(elem => {
        elem.children[0].lookAt(camera.position)
      })
      // hoverPoinsFunc()

      // if (spotLight) {
      //   spotLightHelper.update()
      //   spotLight.position.set(camera.position.clone())
      // }

      if (controls) controls.update();

      renderer.render(scene, camera);
      requestAnimationFrame(tick);

      stats.update();
    }


  }


}


