import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';



const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);



  return (
    <div>
      
    </div>
  );
};

export default ProfilePage;
