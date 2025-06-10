import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SuggestionsList } from '../SuggestionsList';
import type { SuggestionViewModel } from '../useFlashcardGenerator';

// Mock the SuggestionItem component
vi.mock('../SuggestionItem', () => ({
  SuggestionItem: ({ suggestion, onToggle, onDelete, onUpdate }: any) => (
    <div data-testid={`suggestion-item-${suggestion.id}`}>
      <span>{suggestion.front}</span>
      <button 
        data-testid={`toggle-${suggestion.id}`} 
        onClick={() => onToggle(suggestion.id)}
      >
        Toggle
      </button>
      <button 
        data-testid={`delete-${suggestion.id}`} 
        onClick={() => onDelete(suggestion.id)}
      >
        Delete
      </button>
      <button 
        data-testid={`update-${suggestion.id}`} 
        onClick={() => onUpdate(suggestion.id, 'updated front', 'updated back')}
      >
        Update
      </button>
    </div>
  )
}));

describe('SuggestionsList', () => {
  const mockSave = vi.fn();
  const mockChange = vi.fn();
  const mockToggle = vi.fn();
  const mockDelete = vi.fn();
  
  const mockSuggestions: SuggestionViewModel[] = [
    {
      id: 'test-id-1',
      front: 'Question 1',
      back: 'Answer 1',
      isSelected: true,
      isEdited: false,
      originalFront: 'Question 1',
      originalBack: 'Answer 1'
    },
    {
      id: 'test-id-2',
      front: 'Question 2',
      back: 'Answer 2',
      isSelected: false,
      isEdited: true,
      originalFront: 'Original Question 2',
      originalBack: 'Original Answer 2'
    }
  ];
  
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it('renders a message when there are no suggestions', () => {
    render(
      <SuggestionsList
        suggestions={[]}
        onSave={mockSave}
        onSuggestionChange={mockChange}
        onSuggestionToggle={mockToggle}
        onSuggestionDelete={mockDelete}
        isSaving={false}
      />
    );
    
    expect(screen.getByText(/brak dostępnych propozycji/i)).toBeInTheDocument();
  });
  
  it('renders the correct number of suggestion items', () => {
    render(
      <SuggestionsList
        suggestions={mockSuggestions}
        onSave={mockSave}
        onSuggestionChange={mockChange}
        onSuggestionToggle={mockToggle}
        onSuggestionDelete={mockDelete}
        isSaving={false}
      />
    );
    
    expect(screen.getByTestId('suggestion-item-test-id-1')).toBeInTheDocument();
    expect(screen.getByTestId('suggestion-item-test-id-2')).toBeInTheDocument();
  });
  
  it('displays the correct count of selected suggestions', () => {
    render(
      <SuggestionsList
        suggestions={mockSuggestions}
        onSave={mockSave}
        onSuggestionChange={mockChange}
        onSuggestionToggle={mockToggle}
        onSuggestionDelete={mockDelete}
        isSaving={false}
      />
    );
    
    // Get the span element with the selected count
    const countText = screen.getByText(/propozycji wybranych$/i);
    expect(countText).toBeInTheDocument();
    expect(countText.textContent).toContain('1 z 2 propozycji wybranych');
  });
  
  it('calls onSave when the save button is clicked', async () => {
    render(
      <SuggestionsList
        suggestions={mockSuggestions}
        onSave={mockSave}
        onSuggestionChange={mockChange}
        onSuggestionToggle={mockToggle}
        onSuggestionDelete={mockDelete}
        isSaving={false}
      />
    );
    
    const saveButton = screen.getByRole('button', { name: /zapisz wybrane/i });
    await userEvent.click(saveButton);
    
    expect(mockSave).toHaveBeenCalled();
  });
  
  it('disables the save button when isSaving is true', () => {
    render(
      <SuggestionsList
        suggestions={mockSuggestions}
        onSave={mockSave}
        onSuggestionChange={mockChange}
        onSuggestionToggle={mockToggle}
        onSuggestionDelete={mockDelete}
        isSaving={true}
      />
    );
    
    const saveButton = screen.getByRole('button', { name: /zapisywanie/i });
    expect(saveButton).toBeDisabled();
    expect(saveButton).toHaveTextContent('Zapisywanie...');
  });
  
  it('disables the save button when no suggestions are selected', () => {
    const noSelectedSuggestions = mockSuggestions.map(s => ({
      ...s,
      isSelected: false
    }));
    
    render(
      <SuggestionsList
        suggestions={noSelectedSuggestions}
        onSave={mockSave}
        onSuggestionChange={mockChange}
        onSuggestionToggle={mockToggle}
        onSuggestionDelete={mockDelete}
        isSaving={false}
      />
    );
    
    const saveButton = screen.getByRole('button', { name: /zapisz wybrane/i });
    expect(saveButton).toBeDisabled();
  });
  
  it('passes the correct handlers to suggestion items', async () => {
    render(
      <SuggestionsList
        suggestions={mockSuggestions}
        onSave={mockSave}
        onSuggestionChange={mockChange}
        onSuggestionToggle={mockToggle}
        onSuggestionDelete={mockDelete}
        isSaving={false}
      />
    );
    
    // Test toggle
    await userEvent.click(screen.getByTestId('toggle-test-id-1'));
    expect(mockToggle).toHaveBeenCalledWith('test-id-1');
    
    // Test delete
    await userEvent.click(screen.getByTestId('delete-test-id-2'));
    expect(mockDelete).toHaveBeenCalledWith('test-id-2');
    
    // Test update
    await userEvent.click(screen.getByTestId('update-test-id-1'));
    expect(mockChange).toHaveBeenCalledWith('test-id-1', 'updated front', 'updated back');
  });
  
  it('should match snapshot', () => {
    const { container } = render(
      <SuggestionsList
        suggestions={mockSuggestions}
        onSave={mockSave}
        onSuggestionChange={mockChange}
        onSuggestionToggle={mockToggle}
        onSuggestionDelete={mockDelete}
        isSaving={false}
      />
    );
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="space-y-6"
        >
          <div
            class="flex items-center justify-between"
          >
            <div
              class="text-sm"
            >
              <span
                class="font-medium"
              >
                1
              </span>
               z
               
              <span
                class="font-medium"
              >
                2
              </span>
               propozycji wybranych
            </div>
            <button
              class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3 min-w-[120px]"
              data-slot="button"
            >
              Zapisz wybrane
            </button>
          </div>
          <ul
            class="space-y-4"
          >
            <div
              data-testid="suggestion-item-test-id-1"
            >
              <span>
                Question 1
              </span>
              <button
                data-testid="toggle-test-id-1"
              >
                Toggle
              </button>
              <button
                data-testid="delete-test-id-1"
              >
                Delete
              </button>
              <button
                data-testid="update-test-id-1"
              >
                Update
              </button>
            </div>
            <div
              data-testid="suggestion-item-test-id-2"
            >
              <span>
                Question 2
              </span>
              <button
                data-testid="toggle-test-id-2"
              >
                Toggle
              </button>
              <button
                data-testid="delete-test-id-2"
              >
                Delete
              </button>
              <button
                data-testid="update-test-id-2"
              >
                Update
              </button>
            </div>
          </ul>
        </div>
      </div>
    `);
  });
}); 