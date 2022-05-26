/* eslint-disable react/jsx-filename-extension */
import React, { useState, useEffect } from 'react';
import ReviewsList from './reviewList/ReviewsList';
import Sort from './sort/Sort';
import { PRODUCT_ID, URL } from '../../../App';

function Reviews(props) {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(2);
  const [sort, setSort] = useState('relevant');

  function getReviews(id) {
    fetch(
      `${URL}/reviews?product_id=${id}&page=${page}&count=${count}&sort=${sort}`,
      {
        headers: {
          Authorization: process.env.GITTOKEN,
        },
      }
    )
      .then((response) => response.json())
      .then((result) => setReviews(result.results));
  }

  function handleMoreReviews() {
    setCount(count + 2);
    getReviews(PRODUCT_ID);
  }

  function handleSortChange(option) { //"newest", "helpful", or "relevant"
    if (option === 'helpful') {
      setSort('helpful');
    }
    if (option === 'newest') {
      setSort('newest');
    }
    if (option === 'relevant') {
      setSort('relevant');
    }
  }

  useEffect(() => {
    getReviews(PRODUCT_ID);
  }, [count, sort]);

  return (
    <div>
      <Sort
        totalReviews={props.totalReviews}
        sort={sort}
        handleSortChange={handleSortChange}
      />
      <ReviewsList reviews={reviews} />
      <button type="submit" onClick={handleMoreReviews}>More Reviews</button>
      {/* <AddReviewForm /> */}
    </div>
  );
}

export default Reviews;
