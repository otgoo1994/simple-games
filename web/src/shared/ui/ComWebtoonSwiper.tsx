/* eslint-disable react/require-default-props */
import { useEffect, useRef, useState } from 'react';
import { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ComCard } from '~/shared/ui';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { WebtoonType } from '~/entities/common';

interface ComWebtoonSwiperProps {
  webtoons: WebtoonType[];
  swiperKey: string;
  isLoading: boolean;
}

export const ComWebtoonSwiper = ({ webtoons, swiperKey, isLoading }: ComWebtoonSwiperProps) => {
  const [isBeginning, setIsBeginning] = useState(true);
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [isEnd, setIsEnd] = useState(false);

  const updateButtons = (s: SwiperType) => {
    setIsBeginning(s.isBeginning);
    setIsEnd(s.isEnd);
  };

  useEffect(() => {
    if (!swiper) return;

    setIsBeginning(swiper?.isBeginning);
    setIsEnd(swiper.isEnd);
  }, [webtoons]);

  if (isLoading) {
    return (
      <section className="skeleton">
        <div className="skeleton-slider">
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="skeleton-card" key={index}>
              <div className="skeleton-image">
                <div className="skeleton-button" />
              </div>

              <div className="skeleton-name" />
              <div className="skeleton-category" />
            </div>
          ))}

          <div className="skeleton-next">›</div>
        </div>
      </section>
    );
  }

  if (webtoons.length <= 0) {
    return (
      <div className="webtoon-swiper-container">
        <div style={{ color: '#94a3b8', padding: '5rem', textAlign: 'center' }}>No webtoons.</div>
      </div>
    );
  }

  console.log(webtoons, '====');

  return (
    <div className="webtoon-swiper-container">
      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={5}
        onSwiper={(s) => {
          setSwiper(s);
          updateButtons(s);
        }}
        onSlideChange={updateButtons}
        onReachBeginning={updateButtons}
        onReachEnd={updateButtons}
        onFromEdge={updateButtons}
        className="webtoon-swiper"
        breakpoints={{
          0: {
            slidesPerView: 2.2,
            spaceBetween: 12,
          },
          640: {
            slidesPerView: 3.2,
            spaceBetween: 16,
          },
          1024: {
            slidesPerView: 5,
            spaceBetween: 20,
          },
        }}
      >
        {webtoons.map((webtoon) => (
          <SwiperSlide key={`${swiperKey}-${webtoon.seq}`}>
            <ComCard key={webtoon.seq} webtoon={webtoon} />
          </SwiperSlide>
        ))}
      </Swiper>

      {!isBeginning && window.innerWidth >= 1024 && (
        <button onClick={() => swiper?.slidePrev()} className="prev-btn">
          <ChevronLeft />
        </button>
      )}

      {!isEnd && window.innerWidth >= 1024 && (
        <button onClick={() => swiper?.slideNext()} className="next-btn">
          <ChevronRight />
        </button>
      )}
    </div>
  );
};
