import React from "react";

const UserLists = ({ lists, onSelectList }) => {
  return (
    <div>
      <h2>Your Lists</h2>
      <ul>
        {lists.map((list) => (
          <li key={list._id}>
            <h3>{list.name}</h3>
            <p>{list.description}</p>
            <button onClick={() => onSelectList(list)}>Manage Destinations</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserLists;
