import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


export default function ProtectedRoute({ children, roles = [] }){
const { user } = useAuth();
if(!user) return <Navigate to="/login" replace />;
if(roles.length && !roles.includes(user.role)) return <div className="text-center mt-5">Access denied — insufficient permissions</div>;
return children;
}