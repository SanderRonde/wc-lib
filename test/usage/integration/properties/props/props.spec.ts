import { getPropertyFixture } from "../../../lib/testing";
import { propsSpec } from "./propsspec";

propsSpec(getPropertyFixture('props'), getPropertyFixture('props', 'no-proxy'));