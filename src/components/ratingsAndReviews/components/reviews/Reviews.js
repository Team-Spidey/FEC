/* eslint-disable react/jsx-filename-extension */
import React, { useState, useEffect } from 'react';
import ReviewsList from './reviewList/ReviewsList';
import AddReviewForm from './addReview/AddReviewForm';
import Sort from './sort/Sort';
import { PRODUCT_ID, URL } from '../../../App';

function Reviews(props) {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(2);
  const [sort, setSort] = useState('relevant');
  const [toggleModal, setToggleModal] = useState(false)

  function getReviews() {
    fetch(
      `${URL}/reviews?product_id=${PRODUCT_ID}&page=${page}&count=${count}&sort=${sort}`,
      {
        headers: {
          Authorization: process.env.GITTOKEN,
        },
      },
    )
      .then((response) => response.json())
      .then((result) => setReviews(result.results));
  }

  function handleMoreReviews() {
    setCount(count + 2);
    getReviews();
  }

  function handleSortChange(option) {
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

  function handleToggleModalChange() {
    setToggleModal(!toggleModal);
  }

  useEffect(() => {
    getReviews();
  }, [count, sort]);

  return (
    <div>
      <Sort
        totalReviews={props.totalReviews}
        sort={sort}
        handleSortChange={handleSortChange}
      />
      <div className="review-list">
        <ReviewsList
          reviews={reviews}
        />
      </div>
      <button type="button" onClick={handleToggleModalChange}>Add a Review</button>
      { toggleModal
      && (
      <div className="Modal">
        <AddReviewForm handleToggleModalChange={handleToggleModalChange} />
      </div>
      )}
      { reviews.length === count && reviews.length > 0
      && <button type="submit" onClick={handleMoreReviews}>More Reviews</button> }
    </div>
  );
}

export default Reviews;