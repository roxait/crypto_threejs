import { useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { fetchMarketData } from "./fetchMarketData"; // Make sure this returns an array with name & current_price

const ThreeScene = () => {
  const [marketData, setMarketData] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchMarketData();
      setMarketData(data);
    };
    getData();
  }, []);

  useEffect(() => {
    if (marketData.length === 0) return;

    // Setup scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 25;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // Helper: Create text sprite
    const createTextSprite = (message) => {
      const canvas = document.createElement("canvas");
      const size = 512;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = "red";
      ctx.font = "bold 40px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const lines = message.split("\n");
      lines.forEach((line, i) => {
        ctx.fillText(line, size / 2, size / 2 + i * 45 - (lines.length - 1) * 22);
      });

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;

      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(6, 3, 1);
      return sprite;
    };

    // Add spheres and labels
    const spheres = [];
    marketData.forEach((coin) => {
      const geometry = new THREE.SphereGeometry(1.5, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.5,
      });
      const sphere = new THREE.Mesh(geometry, material);

      sphere.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );

      scene.add(sphere);
      spheres.push({ sphere, name: coin.name, price: coin.current_price });

      // Add label
      const label = createTextSprite(`${coin.name}\n$${coin.current_price.toLocaleString()}`);
      label.position.copy(sphere.position).add(new THREE.Vector3(0, 2, 0));
      scene.add(label);
    });

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      spheres.forEach(({ sphere }) => {
        sphere.rotation.y += 0.005;
      });
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.removeChild(renderer.domElement);
    };
  }, [marketData]);

  return null;
};

export default ThreeScene;
