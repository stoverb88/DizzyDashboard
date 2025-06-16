import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player/youtube';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';

interface Video {
  name: string;
  url: string;
}

interface VideoCarouselProps {
  videos: Video[];
}

export function VideoCarousel({ videos }: VideoCarouselProps) {
  const [videoIndex, setVideoIndex] = useState(0);

  useEffect(() => {
    setVideoIndex(0);
  }, [videos]);

  const handlers = useSwipeable({
    onSwipedLeft: () => setVideoIndex((prev) => (prev + 1) % videos.length),
    onSwipedRight: () => setVideoIndex((prev) => (prev - 1 + videos.length) % videos.length),
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  return (
    <div {...handlers} style={{ position: 'relative', overflow: 'hidden', marginBottom: '16px' }}>
      <div style={{ position: 'relative', paddingTop: '56.25%', backgroundColor: '#000' }}>
        <AnimatePresence>
          {videos.map((video, idx) => (
            idx === videoIndex && (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              >
                <ReactPlayer
                  url={video.url}
                  playing={true}
                  controls={true}
                  width="100%"
                  height="100%"
                  style={{ position: 'absolute', top: 0, left: 0 }}
                />
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </div>
      <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 8px', borderRadius: '8px', fontSize: '14px' }}>
        {videos[videoIndex].name}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 0' }}>
        {videos.map((_, idx) => (
          <div key={idx} style={{
            width: idx === videoIndex ? '12px' : '8px',
            height: idx === videoIndex ? '12px' : '8px',
            borderRadius: '50%',
            backgroundColor: idx === videoIndex ? '#667eea' : '#ccc',
            margin: '0 5px',
            transition: 'all 0.3s ease'
          }} />
        ))}
      </div>
    </div>
  );
} 