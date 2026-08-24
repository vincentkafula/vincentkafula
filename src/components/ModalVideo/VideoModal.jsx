import { useState } from "react";
import VideoModal from "../VideoModal/VideoModal";

const VideoSection = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="video-btn">
        <ul>
          <li>
            <button
              className="btn-wrap"
              onClick={() => setIsOpen(true)}
            >
              <i className="fi flaticon-play" aria-hidden="true"></i>
            </button>
          </li>
        </ul>
      </div>

      <VideoModal
        isOpen={isOpen}
        videoId="2lmv6ZDm0vw"
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default VideoSection;