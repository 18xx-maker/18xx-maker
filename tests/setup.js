import * as matchers from "@testing-library/jest-dom/matchers";
import { expect } from "vitest";

import "@tests/i18n";

expect.extend(matchers);
