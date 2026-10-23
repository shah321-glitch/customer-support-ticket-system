import React from "react";
import { useNavigate } from "react-router-dom";
import KnowledgeBase from "../components/KnowledgeBase";

const KnowledgePage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <KnowledgeBase onOpenCreateTicket={() => navigate("/tickets/new")} />
    </div>
  );
};

export default KnowledgePage;

