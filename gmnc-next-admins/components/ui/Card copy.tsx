import React from 'react';

type Props = {
  children: React.ReactNode;
};

const Card: React.FC<Props> = ({ children }) => {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-5">
      {children}
    </div>
  );
};

export default Card;