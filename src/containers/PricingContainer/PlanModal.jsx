import styled from 'styled-components';
import Modal from '../../components/Modal/Modal';

const PlanModal = styled(Modal)`
  width: 540px;
  text-align:center;

  .title {
    text-align: left;
  }

  Section {
    text-align: left;
    margin-bottom: 24px;
  }
`;

export default PlanModal;



// WEBPACK FOOTER //
// ./src/containers/PricingContainer/PlanModal.jsx