import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import MapViewer from './components/map/MapViewer';
import VerseReader from './components/bible/VerseReader';
import ParallelReader from './components/bible/ParallelReader';
import JourneyPlayer from './components/journeys/JourneyPlayer';
import StoryMode from './components/story/StoryMode';
import Sidebar from './components/ui/Sidebar';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <Switch>
          <Route path="/" exact component={MapViewer} />
          <Route path="/bible" component={VerseReader} />
          <Route path="/parallel" component={ParallelReader} />
          <Route path="/journey" component={JourneyPlayer} />
          <Route path="/story" component={StoryMode} />
        </Switch>
      </div>
    </Router>
  );
};

export default App;