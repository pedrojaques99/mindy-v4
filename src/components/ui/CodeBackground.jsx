import React, { useEffect, useRef, useState } from 'react';

const CodeBackground = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);
  const isInitializedRef = useRef(false);
  
  // Initialize canvas and particles
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (!canvas || !container || isInitializedRef.current) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    let particles = [];
    
    const init = () => {
      isInitializedRef.current = true;
      
      // Set canvas to full size
      const handleResize = () => {
        // Get the actual size of the container
        const containerRect = container.getBoundingClientRect();
        const width = containerRect.width;
        const height = containerRect.height;
        
        console.log("Canvas container size:", width, "x", height);
        
        const dpr = window.devicePixelRatio || 1;
        
        // Set actual size in memory (scaled for pixel density)
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        
        // Scale down to the display size
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        
        // Adjust for HiDPI displays
        ctx.scale(dpr, dpr);
        
        // More particles for increased visibility, scaled to the actual size
        const particleCount = Math.min(300, Math.floor((width * height) / 6000));
        console.log("Generating", particleCount, "particles");
        generateParticles(particleCount);
      };

      const generateParticles = (amount) => {
        particles = [];
        const width = canvas.width / (window.devicePixelRatio || 1);
        const height = canvas.height / (window.devicePixelRatio || 1);
        
        console.log("Particle area:", width, "x", height);
        
        for (let i = 0; i < amount; i++) {
          // Increased visibility with more varied sizes and higher alpha values
          const isHighlighted = Math.random() > 0.7; // 30% of particles will be highlighted
          
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 3 + 1, // Larger size range
            color: isHighlighted ? '#bfff58' : (Math.random() > 0.7 ? '#bfff58' : '#ffffff'),
            speedX: Math.random() * 0.4 - 0.2,
            speedY: Math.random() * 0.4 - 0.2,
            char: getRandomChar(),
            alpha: isHighlighted ? 
                  Math.random() * 0.4 + 0.3 : // Highlighted particles: 0.3-0.7 alpha
                  Math.random() * 0.3 + 0.15, // Regular particles: 0.15-0.45 alpha
            fontSize: isHighlighted ? 
                     Math.floor(Math.random() * 8) + 10 : // Highlighted: 10-18px
                     Math.floor(Math.random() * 6) + 8,   // Regular: 8-14px
            blinking: Math.random() > 0.6, // More blinking particles
            blinkSpeed: Math.random() * 0.05 + 0.02,
            blinkState: 0,
            lastCharChange: Date.now(),
            glow: isHighlighted // Add glow effect to highlighted particles
          });
        }
        particlesRef.current = particles;
      };
      
      // Initial setup
      handleResize();
      
      // Handle window resize
      window.addEventListener('resize', handleResize);
      
      // Force resize after a short delay to ensure proper dimensions
      setTimeout(handleResize, 100);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        isInitializedRef.current = false;
      };
    };
    
    const cleanup = init();
    return cleanup;
  }, []);
  
  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const container = containerRef.current;
      if (!container) return;
      
      // Get container position
      const rect = container.getBoundingClientRect();
      
      // Calculate mouse position relative to container
      setMousePosition({
        x: clientX - rect.left,
        y: clientY - rect.top
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Animation loop with throttling for better performance
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isInitializedRef.current) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    let particles = particlesRef.current;
    let lastTime = 0;
    
    const animate = (timestamp) => {
      // Throttle to max 30fps for better performance
      if (timestamp - lastTime < 33) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      
      lastTime = timestamp;
      const now = Date.now();
      
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach((particle) => {
        // Add some mouseover interaction
        const dx = mousePosition.x - particle.x;
        const dy = mousePosition.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 150; // Increased influence radius
        
        if (distance < maxDistance) {
          // Calculate the force (stronger when closer)
          const force = (maxDistance - distance) / maxDistance;
          
          // Apply the force to the particle's position (repel from cursor)
          particle.x -= dx * force * 0.05; // Stronger repulsion
          particle.y -= dy * force * 0.05;
          
          // Make the particle more visible when mouse is near
          particle.alpha = Math.min(0.9, particle.alpha + force * 0.4);
        } else {
          // Slowly return to original alpha
          particle.alpha = Math.max(particle.alpha - 0.01, particle.glow ? 0.3 : (particle.blinking ? 0.15 : 0.2));
        }
        
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Boundary check with some padding
        const padding = 20;
        
        if (particle.x < -padding) particle.x = width + padding;
        if (particle.x > width + padding) particle.x = -padding;
        if (particle.y < -padding) particle.y = height + padding;
        if (particle.y > height + padding) particle.y = -padding;
        
        // Blinking effect for some particles
        if (particle.blinking) {
          particle.blinkState += particle.blinkSpeed;
          particle.alpha = particle.alpha * (0.7 + 0.3 * Math.sin(particle.blinkState));
        }
        
        // Randomly change the character every 3-8 seconds
        if (now - particle.lastCharChange > 3000 + Math.random() * 5000) {
          particle.char = getRandomChar();
          particle.lastCharChange = now;
        }
        
        // Draw text with optional glow effect
        ctx.font = `${particle.fontSize}px "Courier New", monospace`;
        
        if (particle.glow) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = particle.color;
        }
        
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.alpha;
        ctx.fillText(particle.char, particle.x, particle.y);
        
        // Reset shadow
        if (particle.glow) {
          ctx.shadowBlur = 0;
          ctx.shadowColor = 'transparent';
        }
      });
      
      particlesRef.current = particles;
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mousePosition]);
  
  // Function to generate random characters
  const getRandomChar = () => {
    // More focused on code characters with higher probability
    const dataChars = '01';
    const codeChars = '{}[]()<>+-*/=.;:';
    const alphaChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    
    const randomValue = Math.random();
    
    if (randomValue < 0.6) { // 60% data characters
      return dataChars.charAt(Math.floor(Math.random() * dataChars.length));
    } else if (randomValue < 0.9) { // 30% code symbols
      return codeChars.charAt(Math.floor(Math.random() * codeChars.length));
    } else { // 10% letters
      return alphaChars.charAt(Math.floor(Math.random() * alphaChars.length));
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
    >
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full opacity-40"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
};

export default CodeBackground; 