/* eslint-disable react/require-default-props */
import { ChapterType } from '~/entities/common';
import { Link } from 'react-router-dom';

interface ComChapterCardProps {
  webtoon: ChapterType;
}

export const ComChapterCard = ({ webtoon }: ComChapterCardProps) => {
  const baseUrl = import.meta.env.VITE_BASE_URL;

  return (
    <Link to={`/viewer/${webtoon.series_id}?chapter=${webtoon.chapter}`} className="card__link">
      <div className="card">
        <div className="card__thumb-wrap">
          <div className="card__thumb-wrap-chapter-title">Chapter {webtoon.chapter}</div>
          {webtoon.is_adult === 'Y' && (
            <div className="card__thumb-wrap-chapter-adult-title">+18</div>
          )}
          <img
            src={`${baseUrl}/common/download/${webtoon.file_id}`}
            alt={webtoon.name}
            className={`card__img ${webtoon.is_adult === 'Y' && 'sensitive'}`}
          />
          {/* {webtoon.isNew && <div className="card__badge">UP</div>} */}
          <div className="card__overlay">
            <button className="card__overlay-btn">УНШИХ</button>
          </div>
        </div>

        <div className="card__info">
          <h3 className="card__title">{webtoon.name}</h3>
          <div className="card__meta">
            {webtoon.categories.map((category) => (
              <p key={`category-name-tag-${category.category_id}`} className="card__meta-genre">
                {category.category_name}
              </p>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};
