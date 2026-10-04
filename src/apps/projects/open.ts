import { useOS, type Point } from "../../os/store";

/** Opens Projelerim on one project's detail page. */
export function openProject(id: string, origin?: Point) {
  useOS.setState({ projectId: id });
  useOS.getState().launch("projects", origin);
}
