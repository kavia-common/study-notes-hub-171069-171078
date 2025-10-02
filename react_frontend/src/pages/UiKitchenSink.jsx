import React, { useState, useRef } from "react";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Modal from "../components/ui/Modal.jsx";
import Tag from "../components/ui/Tag.jsx";
import Badge from "../components/ui/Badge.jsx";
import Spinner from "../components/ui/Spinner.jsx";

/**
 * PUBLIC_INTERFACE
 * UiKitchenSink shows sample usage of reusable UI primitives for developers.
 * Route is not linked in navbar to avoid clutter; visit /__ui for reference.
 */
export default function UiKitchenSink() {
  const [open, setOpen] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const focusRef = useRef(null);

  return (
    <div className="card" aria-label="UI Kitchen Sink" style={{ display: "grid", gap: "1rem" }}>
      <header>
        <h1>UI Primitives</h1>
        <p className="text-muted">Examples of Button, Input, Select, Modal, Tag, Badge, Spinner</p>
      </header>

      <section>
        <h3>Buttons</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button iconOnly aria-label="Settings" title="Settings" icon="⚙️" />
          <Button disabled={disabled} onClick={() => alert("Clicked!")}>
            {disabled ? "Disabled" : "Clickable"}
          </Button>
          <Button onClick={() => setDisabled((d) => !d)} variant="ghost">
            Toggle Disabled
          </Button>
        </div>
      </section>

      <section>
        <h3>Inputs</h3>
        <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
          <Input label="Email" inputProps={{ type: "email", placeholder: "you@example.com" }} helpText="We'll never share your email." />
          <Input label="With error" error="This field is required" required inputProps={{ placeholder: "Required field" }} />
          <Select
            label="Subject"
            placeholder="Select a subject"
            options={[
              { value: "math", label: "Mathematics" },
              { value: "physics", label: "Physics" },
              { value: "cs", label: "Computer Science" },
            ]}
          />
        </div>
      </section>

      <section>
        <h3>Tags & Badges</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Tag>#general</Tag>
          <Tag tone="primary">primary</Tag>
          <Tag tone="success">success</Tag>
          <Tag tone="danger">danger</Tag>
          <Badge>beta</Badge>
          <Badge tone="primary">new</Badge>
          <Badge tone="success">success</Badge>
          <Badge tone="danger">error</Badge>
        </div>
      </section>

      <section>
        <h3>Spinner</h3>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <Spinner size="sm" />
          <Spinner />
          <Spinner size="lg" />
          <Button onClick={() => setOpen(true)}>Open Modal</Button>
        </div>
      </section>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Example Modal"
        initialFocusRef={focusRef}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button ref={focusRef} onClick={() => setOpen(false)} data-autofocus>
              Confirm
            </Button>
          </div>
        }
      >
        <p className="text-muted" style={{ margin: 0 }}>
          This is a reusable, accessible modal with focus trap and ESC close.
        </p>
      </Modal>
    </div>
  );
}
