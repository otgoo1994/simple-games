export const ComSkeleton = () => {
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
      </div>
    </section>
  );
};
