// src/components/ScrollStack.jsx
import  { useRef, useEffect, useState, useCallback, useMemo, Children } from 'react';
import { motion, useTransform, useSpring, useScroll } from 'framer-motion';

// ============================================
// SCROLL STACK ITEM
// ============================================
export const ScrollStackItem = ({ children, className = '' }) => {
  return (
    <div className={`scroll-stack-item ${className}`}>
      {children}
    </div>
  );
};

// ============================================
// MAIN SCROLL STACK COMPONENT
// ============================================
const ScrollStack = ({
  children,
  itemDistance = 60,
  itemStackDistance = 20,
  stackPosition = '15%',
  baseScale = 0.9,
  rotationAmount = 1,
  blurAmount = 1,
  useWindowScroll = true,
  onStackComplete = () => {},
  className = '',
  containerClassName = '',
  itemClassName = '',
}) => {
  const containerRef = useRef(null);
  const [isStackComplete, setIsStackComplete] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Get children count
  const childrenArray = Children.toArray(children);
  const validChildren = childrenArray.filter(child => child.type === ScrollStackItem);
  const itemCount = validChildren.length;
  const containerHeight = itemCount > 0 ? itemCount * itemDistance + 200 : 0;

  // ============================================
  // SCROLL HANDLING
  // ============================================
  const { scrollYProgress } = useScroll({
    target: useWindowScroll ? undefined : containerRef,
    offset: ["start start", "end end"],
  });

  const springConfig = { stiffness: 100, damping: 30, mass: 0.5 };

  // Smooth scroll progress with spring
  const smoothProgress = useSpring(scrollYProgress, springConfig);

  // Transform for progress bar width
  const progressBarWidth = useTransform(smoothProgress, [0, 1], ['0%', '100%']);

  // ============================================
  // ITEM POSITIONS
  // ============================================
  const getItemStyle = useCallback((index, progress) => {
    const totalItems = itemCount;
    const normalizedIndex = index / totalItems;
    
    // Calculate position relative to scroll
    const scrollStart = normalizedIndex - 0.2;
    const scrollEnd = normalizedIndex + 0.2;
    
    let itemProgress = (progress - scrollStart) / (scrollEnd - scrollStart);
    itemProgress = Math.max(0, Math.min(1, itemProgress));

    // Scale: shrink from 1 to baseScale
    const scale = 1 - (1 - baseScale) * itemProgress;
    
    // Translate: move up and stack
    const translateY = -itemProgress * itemStackDistance;
    
    // Rotation: slight rotation for depth effect
    const rotate = (itemProgress - 0.5) * rotationAmount * 2;
    
    // Blur: increase blur as item goes back
    const blur = itemProgress * blurAmount;
    
    // Opacity: fade slightly at the end
    const opacity = 1 - itemProgress * 0.2;

    // Z-index: higher index = higher z-index
    const zIndex = Math.round((1 - itemProgress) * 100) + index;

    return {
      scale,
      translateY,
      rotate,
      blur,
      opacity,
      zIndex,
      progress: itemProgress,
    };
  }, [itemCount, baseScale, itemStackDistance, rotationAmount, blurAmount]);

  // ============================================
  // RENDER ITEMS
  // ============================================
  const renderItems = useMemo(() => {
    return validChildren.map((child, index) => {
      const style = getItemStyle(index, smoothProgress.get());

      return (
        <motion.div
          key={index}
          className={`scroll-stack-item-wrapper ${itemClassName}`}
          style={{
            position: 'sticky',
            top: `calc(${stackPosition} - ${index * itemDistance}px)`,
            zIndex: style.zIndex,
            opacity: style.opacity,
            scale: style.scale,
            y: style.translateY,
            rotate: style.rotate,
            filter: `blur(${style.blur}px)`,
            transformOrigin: 'center top',
            transition: 'all 0.1s ease-out',
          }}
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.2 },
          }}
        >
          <div className="scroll-stack-item-container h-full w-full">
            {child}
          </div>
        </motion.div>
      );
    });
  }, [validChildren, smoothProgress, getItemStyle, stackPosition, itemDistance, itemClassName]);

  // ============================================
  // DETECT STACK COMPLETE
  // ============================================
  useEffect(() => {
    const unsubscribe = smoothProgress.onChange((value) => {
      if (value >= 0.85 && !isStackComplete) {
        setIsStackComplete(true);
        onStackComplete();
      } else if (value < 0.85) {
        setIsStackComplete(false);
      }

      // Update active index
      const newActiveIndex = Math.floor(value * itemCount);
      if (newActiveIndex !== activeIndex && newActiveIndex < itemCount) {
        setActiveIndex(newActiveIndex);
      }
    });

    return () => unsubscribe();
  }, [smoothProgress, isStackComplete, onStackComplete, itemCount, activeIndex]);

  // ============================================
  // INDICATOR DOTS
  // ============================================
  const renderIndicators = () => {
    if (itemCount <= 1) return null;

    return (
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-30">
        {validChildren.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === activeIndex
                ? 'bg-orange-500 w-3 h-3 shadow-lg shadow-orange-500/50'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            onClick={() => {
              const targetScroll = (index / itemCount) * containerHeight;
              if (containerRef.current) {
                containerRef.current.scrollTo({
                  top: targetScroll,
                  behavior: 'smooth',
                });
              }
            }}
            aria-label={`Go to item ${index + 1}`}
          />
        ))}
      </div>
    );
  };

  // ============================================
  // PROGRESS BAR
  // ============================================
  const renderProgress = () => {
    if (itemCount <= 1) return null;

    return (
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 z-20">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-400 to-orange-500"
          style={{ width: progressBarWidth }}
        />
      </div>
    );
  };

  // ============================================
  // COUNTER
  // ============================================
  const renderCounter = () => {
    if (itemCount <= 1) return null;

    return (
      <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg z-20 text-sm font-medium text-gray-700 dark:text-gray-300">
        {activeIndex + 1} / {itemCount}
      </div>
    );
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div
      ref={containerRef}
      className={`scroll-stack-container relative w-full overflow-y-auto ${containerClassName}`}
      style={{
        height: containerHeight > 0 ? containerHeight : 'auto',
        scrollBehavior: 'smooth',
      }}
    >
      <style>{`
        .scroll-stack-container::-webkit-scrollbar {
          width: 6px;
        }
        .scroll-stack-container::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
          border-radius: 3px;
        }
        .scroll-stack-container::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.2);
          border-radius: 3px;
        }
        .scroll-stack-container::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.3);
        }
        .dark .scroll-stack-container::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
        }
        .dark .scroll-stack-container::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
        }
        .scroll-stack-item-wrapper {
          will-change: transform, opacity, filter;
          width: 100%;
          padding: 4px 0;
        }
        .scroll-stack-item-container {
          height: 100%;
          min-height: 300px;
        }
        .scroll-stack-item {
          height: 100%;
          min-height: 300px;
        }
      `}</style>

      {/* Progress Bar */}
      {renderProgress()}

      {/* Counter */}
      {renderCounter()}

      {/* Indicators */}
      {renderIndicators()}

      {/* Items */}
      <div className={`scroll-stack-items relative px-4 md:px-6 ${className}`}>
        {renderItems}
      </div>

      {/* Stack Complete Message */}
      {isStackComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500/10 backdrop-blur-sm px-4 py-2 rounded-full border border-green-500/20 z-20"
        >
          <span className="text-green-600 dark:text-green-400 text-sm font-medium">
            ✨ You've reached the end!
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default ScrollStack;