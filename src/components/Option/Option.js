import React from "react";
import styled from "styled-components";

const InfoCard = styled.button`
  background-color: ${({ theme, active }) =>
    active ? theme.headerBackground : theme.headerNotActiveBackground};
  padding: 1rem;
  outline: none;
  border: 1px solid;
  border-radius: 12px;
  width: 100% !important;
  &:focus {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.focusSecondary};
  }
  border-color: ${({ theme, active }) =>
    active ? "transparent" : theme.headerBackground};
`;

const OptionCard = styled(InfoCard)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 2rem;
  padding: 1rem;
`;

const OptionCardLeft = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  justify-content: center;
  height: 100%;
`;

const OptionCardClickable = styled(OptionCard)`
  margin-top: 0;
  &:hover {
    cursor: ${({ clickable }) => (clickable ? "pointer" : "")};
    border: ${({ clickable, theme }) =>
      clickable ? `1px solid ${theme.focusSecondary}` : ``};
  }
  opacity: ${({ disabled }) => (disabled ? "0.5" : "1")};
`;

const GreenCircle = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  justify-content: center;
  align-items: center;

  &:first-child {
    height: 8px;
    width: 8px;
    margin-right: 8px;
    background-color: ${({ theme }) => theme.green1};
    border-radius: 50%;
  }
`;

const CircleWrapper = styled.div`
  color: ${({ theme }) => theme.green1};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const HeaderText = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  color: ${(props) =>
    props.active
      ? ({ theme }) => theme.headerText
      : ({ theme }) => theme.headerNotActiveText};
  font-size: 1rem;
  font-weight: 500;
`;

const SubHeader = styled.div`
  color: ${({ theme }) => theme.headerText};
  margin-top: 10px;
  font-size: 12px;
`;

const IconWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  & > img,
  span {
    height: ${({ size }) => (size ? size + "px" : "24px")};
    width: ${({ size }) => (size ? size + "px" : "24px")};
  }
  @media ${({ theme }) => theme.MEDIA_TABLET_OR_LESS} {
    align-items: flex-end;
  }
`;

export default function Option({
  link = null,
  clickable = true,
  size,
  onClick = null,
  color,
  header,
  subheader = null,
  icon,
  active = false,
  id,
}) {
  const content = (
    <OptionCardClickable
      id={id}
      onClick={onClick}
      clickable={clickable && !active}
      active={active}
    >
      <OptionCardLeft>
        <HeaderText color={color} active={active}>
          {active ? (
            <CircleWrapper>
              <GreenCircle>
                <div />
              </GreenCircle>
            </CircleWrapper>
          ) : (
            ""
          )}
          {header}
        </HeaderText>
        {subheader && <SubHeader>{subheader}</SubHeader>}
      </OptionCardLeft>
      <IconWrapper size={size}>
        <img src={icon} alt={"Icon"} />
      </IconWrapper>
    </OptionCardClickable>
  );
  if (link) {
    return <a href={link}>{content}</a>;
  }

  return content;
}
