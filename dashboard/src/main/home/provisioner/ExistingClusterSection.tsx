import React, { Component } from "react";
import styled from "styled-components";

import api from "shared/api";
import { ProjectType } from "shared/types";
import { isAlphanumeric } from "shared/common";
import { Context } from "shared/Context";
import { pushQueryParams, pushFiltered } from "shared/routing";

import SaveButton from "components/SaveButton";
import { RouteComponentProps, withRouter } from "react-router";

type PropsType = RouteComponentProps & {
  projectName: string;
};

type StateType = {
  buttonStatus: string;
};

class ExistingClusterSection extends Component<PropsType, StateType> {
  state = {
    buttonStatus: "",
  };

  setCurrentProject = (project: ProjectType, callback?: any) => {
    this.context.setCurrentProject(project, () => {
      if (project) {
        pushQueryParams(this.props, { project_id: project.id.toString() });
      }
      callback && callback();
    });
  }

  onCreateProject = () => {
    let { projectName } = this.props;
    let { user, setProjects } = this.context;

    this.setState({ buttonStatus: "loading" });
    api
      .createProject("<token>", { name: projectName }, {})
      .then((res) =>
        api.getProjects(
          "<token>",
          {},
          {
            id: user.userId,
          }
        )
      )
      .then((res) => {
        if (res.data) {
          setProjects(res.data);
          if (res.data.length > 0) {
            let proj = res.data.find((el: ProjectType) => {
              return el.name === projectName;
            });
            this.setCurrentProject(proj);
            pushFiltered(this.props, "dashboard?tab=overview", ["project_id"]);
          }
        }
      })
      .catch(console.log);
  };

  render() {
    let { children, projectName } = this.props;
    let { buttonStatus } = this.state;
    return (
      <StyledExistingClusterSection>
        <Placeholder>
          You can manually link to an existing cluster once this project has
          been created.
        </Placeholder>
        {children ? children : <Padding />}
        <SaveButton
          text="Submit"
          disabled={!isAlphanumeric(projectName)}
          onClick={this.onCreateProject}
          status={buttonStatus}
          makeFlush={true}
          helper="Note: Provisioning can take up to 15 minutes"
        />
      </StyledExistingClusterSection>
    );
  }
}

ExistingClusterSection.contextType = Context;

export default withRouter(ExistingClusterSection);

const Padding = styled.div`
  height: 15px;
`;

const StyledExistingClusterSection = styled.div`
  position: relative;
  padding-bottom: 35px;
`;

const Placeholder = styled.div`
  margin-top: 25px;
  background: #26282f;
  margin-bottom: 27px;
  border-radius: 5px;
  height: 170px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff44;
  font-size: 13px;
`;
