import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";

// SchemaField first: the forms import each other in a cycle
import "@/components/schemaForm/SchemaField";

import GameInfoForm from "@/components/schemaForm/GameInfoForm";
import RoundsForm from "@/components/schemaForm/RoundsForm";

import { games } from "@/data";
import { initialState, rootReducer } from "@/state";

const show = (Form, game) =>
  render(
    <Provider
      store={configureStore({
        reducer: rootReducer,
        preloadedState: initialState,
      })}
    >
      <MemoryRouter>
        <Form game={game} />
      </MemoryRouter>
    </Provider>,
  );

const withInfo = (info) => ({
  ...games["18Test"],
  info: { ...games["18Test"].info, ...info },
});

describe("a deprecated field in the edit panel", () => {
  it("is not offered in an object that does not have it", () => {
    show(GameInfoForm, withInfo({ titleFontSize: 90 }));
    expect(screen.getAllByText(/Title Font Size/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Title Size/i)).not.toBeInTheDocument();
  });

  it("is shown while the game has it", () => {
    show(GameInfoForm, withInfo({ titleSize: 90 }));
    expect(screen.getAllByText(/Title Size/i).length).toBeGreaterThan(0);
  });

  it("is not offered as a list that the game does not have", () => {
    const { container } = show(RoundsForm, {
      ...games["18Test"],
      numberCards: ["red"],
    });
    expect(container).toHaveTextContent(/Number Cards/);
    expect(container).not.toHaveTextContent(/Deprecated/);
  });

  it("is shown as a list that the game has", () => {
    const { container } = show(RoundsForm, {
      ...games["18Test"],
      number_cards: ["red"],
    });
    expect(container).toHaveTextContent(/Number cards\s*Deprecated/);
  });
});
