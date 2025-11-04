import React from 'react';


export default function ProCard({ title, children, footer }){
return (
<div className="card shadow-sm pro-card">
<div className="card-body">
<h5 className="card-title fw-bold">{title}</h5>
<div className="card-content">{children}</div>
</div>
{footer && <div className="card-footer small text-muted">{footer}</div>}
</div>
);
}
// ✅ Add prop types validation
ProCard.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
  footer: PropTypes.node
};