import { z } from 'zod';
import {
  Transformation,
  AdaptiveStrategy,
  ConsequenceRecord,
  AdaptiveStrategySchema,
} from '../../src/types/agent-observability';

/**
 * Cellular Membrane: Selective permeability system
 * Controls what enters/exits the cellular system and maintains homeostasis
 */

export interface MembraneChannel {
  id: string;
  type: 'sodium' | 'potassium' | 'calcium' | 'data' | 'energy';
  isOpen: boolean;
  selectivity: string[];
  conductance: number; // 0-1
  gateVoltage?: number;
}

export interface HomeostasisMetrics {
  pH: number; // System acidity/alkalinity
  temperature: number; // Processing heat
  pressure: number; // System load
  ionBalance: Record<string, number>;
  timestamp: string;
}

export class CellularMembrane {
  private channels: MembraneChannel[] = [];
  private homeostasisMetrics: HomeostasisMetrics;
  private permeabilityRules: Map<string, boolean> = new Map();

  constructor() {
    this.initializeChannels();
    this.homeostasisMetrics = this.getBaselineMetrics();
    this.setupPermeabilityRules();
    this.startHomeostasisMonitoring();
  }

  async checkPermeability(data: any, destination: 'nucleus' | 'organelle' | 'cytoplasm'): Promise<{
    allowed: boolean;
    channel?: string;
    reason: string;
    modifications?: any;
  }> {
    // Selective permeability based on destination and data type
    const dataType = this.identifyDataType(data);
    const appropriateChannel = this.findChannel(dataType, destination);

    if (!appropriateChannel || !appropriateChannel.isOpen) {
      return {
        allowed: false,
        reason: `No open channel for ${dataType} to ${destination}`
      };
    }

    // Check if data meets selectivity criteria
    const selectivityCheck = this.checkSelectivity(data, appropriateChannel);
    if (!selectivityCheck.passes) {
      return {
        allowed: false,
        channel: appropriateChannel.id,
        reason: selectivityCheck.reason
      };
    }

    // Apply membrane modifications (like ion pumps)
    const modifications = await this.applyMembraneModifications(data, appropriateChannel);

    return {
      allowed: true,
      channel: appropriateChannel.id,
      reason: 'Permeability check passed',
      modifications
    };
  }

  async maintainHomeostasis(): Promise<HomeostasisMetrics> {
    // Regulate system conditions like a cell membrane
    const currentMetrics = await this.measureCurrentConditions();
    
    // pH regulation (system stability)
    if (currentMetrics.pH < 6.5 || currentMetrics.pH > 8.5) {
      await this.regulatePH(currentMetrics.pH);
    }

    // Temperature regulation (processing heat)
    if (currentMetrics.temperature > 80) {
      await this.coolSystem();
    }

    // Pressure regulation (system load)
    if (currentMetrics.pressure > 0.9) {
      await this.reduceSystemLoad();
    }

    // Ion balance (resource distribution)
    await this.balanceIons(currentMetrics.ionBalance);

    this.homeostasisMetrics = currentMetrics;
    return currentMetrics;
  }

  async facilitatedDiffusion(data: any, gradient: 'high-to-low' | 'low-to-high'): Promise<any> {
    // Move data along concentration gradients (like glucose transport)
    const channel = this.findFacilitatedChannel(data);
    
    if (!channel) {
      throw new Error('No facilitated diffusion channel available');
    }

    // Apply gradient-based modifications
    const processed = await this.processAlongGradient(data, gradient, channel);
    
    // Update channel conductance based on usage
    channel.conductance = Math.min(1, channel.conductance + 0.01);
    
    return processed;
  }

  async activateTransport(data: any, destination: string, energyCost: number): Promise<any> {
    // Active transport against gradients (requires ATP)
    const availableEnergy = await this.getAvailableATP();
    
    if (availableEnergy < energyCost) {
      throw new Error('Insufficient ATP for active transport');
    }

    // Find or create active transport channel
    const transportChannel = this.getActiveTransportChannel(destination);
    
    // Consume energy and transport data
    await this.consumeATP(energyCost);
    const transported = await this.activelyTransport(data, transportChannel);
    
    return transported;
  }

  getMembraneStatus(): {
    channels: MembraneChannel[];
    homeostasis: HomeostasisMetrics;
    permeability: string[];
    integrity: number;
  } {
    const openChannels = this.channels.filter(c => c.isOpen);
    const averageConductance = openChannels.length > 0 
      ? openChannels.reduce((sum, c) => sum + c.conductance, 0) / openChannels.length
      : 0;

    return {
      channels: this.channels,
      homeostasis: this.homeostasisMetrics,
      permeability: Array.from(this.permeabilityRules.keys()),
      integrity: averageConductance
    };
  }

  private initializeChannels(): void {
    // Initialize membrane channels like a real cell
    this.channels = [
      {
        id: 'data-channel-1',
        type: 'data',
        isOpen: true,
        selectivity: ['transformation', 'consequence', 'strategy'],
        conductance: 0.8
      },
      {
        id: 'energy-channel-1',
        type: 'energy',
        isOpen: true,
        selectivity: ['atp', 'glucose', 'processing_power'],
        conductance: 0.9
      },
      {
        id: 'sodium-channel-1',
        type: 'sodium',
        isOpen: false,
        selectivity: ['core_protection', 'security'],
        conductance: 0.3,
        gateVoltage: -70
      },
      {
        id: 'potassium-channel-1',
        type: 'potassium',
        isOpen: true,
        selectivity: ['learning', 'adaptation'],
        conductance: 0.7
      },
      {
        id: 'calcium-channel-1',
        type: 'calcium',
        isOpen: false,
        selectivity: ['emergency', 'stress_response'],
        conductance: 0.2,
        gateVoltage: -40
      }
    ];
  }

  private getBaselineMetrics(): HomeostasisMetrics {
    return {
      pH: 7.4, // Optimal cellular pH
      temperature: 37, // Normal cellular temperature
      pressure: 0.5, // Moderate system load
      ionBalance: {
        sodium: 145,
        potassium: 5,
        calcium: 2.5,
        data: 100,
        energy: 80
      },
      timestamp: new Date().toISOString()
    };
  }

  private setupPermeabilityRules(): void {
    // Define what can pass through the membrane
    this.permeabilityRules.set('transformation_data', true);
    this.permeabilityRules.set('learning_strategies', true);
    this.permeabilityRules.set('consequence_records', true);
    this.permeabilityRules.set('core_modifications', false); // Blocked!
    this.permeabilityRules.set('security_breaches', false); // Blocked!
    this.permeabilityRules.set('system_errors', true); // Allow for processing
    this.permeabilityRules.set('performance_metrics', true);
  }

  private identifyDataType(data: any): string {
    if (data?.type === 'transformation') return 'transformation_data';
    if (data?.category === 'core_protection') return 'core_modifications';
    if (data?.severity === 'critical') return 'security_breaches';
    if (data?.guardrails) return 'consequence_records';
    if (data?.pattern) return 'learning_strategies';
    if (data?.metrics) return 'performance_metrics';
    if (data?.error) return 'system_errors';
    
    return 'unknown_data';
  }

  private findChannel(dataType: string, destination: string): MembraneChannel | undefined {
    return this.channels.find(channel => {
      const isAppropriate = this.isChannelAppropriate(channel, dataType, destination);
      return isAppropriate && channel.isOpen;
    });
  }

  private isChannelAppropriate(channel: MembraneChannel, dataType: string, destination: string): boolean {
    // Match channel type to data and destination
    if (destination === 'nucleus' && channel.type !== 'sodium') {
      return false; // Only sodium channels can reach nucleus (high selectivity)
    }
    
    if (dataType.includes('energy') && channel.type !== 'energy') {
      return false;
    }
    
    if (dataType.includes('learning') && channel.type === 'potassium') {
      return true; // Potassium channels good for learning
    }
    
    return channel.type === 'data' || channel.selectivity.some(s => dataType.includes(s));
  }

  private checkSelectivity(data: any, channel: MembraneChannel): { passes: boolean; reason: string } {
    // Check if data meets channel selectivity requirements
    const dataType = this.identifyDataType(data);
    
    if (!this.permeabilityRules.get(dataType)) {
      return {
        passes: false,
        reason: `Data type ${dataType} is blocked by membrane rules`
      };
    }

    if (channel.selectivity.length === 0) {
      return { passes: true, reason: 'Non-selective channel' };
    }

    const matches = channel.selectivity.some(selector => 
      dataType.includes(selector) || JSON.stringify(data).includes(selector)
    );

    return {
      passes: matches,
      reason: matches ? 'Selectivity criteria met' : 'Data does not match channel selectivity'
    };
  }

  private async applyMembraneModifications(data: any, channel: MembraneChannel): Promise<any> {
    // Apply modifications like ion pumps or membrane proteins
    const modifications: any = { ...data };

    // Add membrane transport metadata
    modifications._membrane = {
      channel: channel.id,
      transportTime: new Date().toISOString(),
      conductance: channel.conductance,
      modifications: []
    };

    // Apply channel-specific modifications
    switch (channel.type) {
      case 'sodium':
        // High security processing
        modifications._membrane.modifications.push('security_verified');
        modifications.securityLevel = 'high';
        break;
        
      case 'potassium':
        // Learning enhancement
        modifications._membrane.modifications.push('learning_enhanced');
        if (modifications.confidence) {
          modifications.confidence *= 1.1; // Boost learning confidence
        }
        break;
        
      case 'calcium':
        // Stress response activation
        modifications._membrane.modifications.push('stress_response_activated');
        modifications.priority = 'high';
        break;
        
      case 'energy':
        // Energy optimization
        modifications._membrane.modifications.push('energy_optimized');
        modifications.efficiency = (modifications.efficiency || 0.5) * 1.2;
        break;
    }

    return modifications;
  }

  private async measureCurrentConditions(): Promise<HomeostasisMetrics> {
    // Measure current system conditions
    const currentTime = Date.now();
    const baseTime = new Date(this.homeostasisMetrics.timestamp).getTime();
    const timeDelta = (currentTime - baseTime) / 1000; // seconds

    // Simulate condition changes over time
    const pH = this.homeostasisMetrics.pH + (Math.random() - 0.5) * 0.2;
    const temperature = this.homeostasisMetrics.temperature + (Math.random() - 0.5) * 5;
    const pressure = Math.max(0, Math.min(1, this.homeostasisMetrics.pressure + (Math.random() - 0.5) * 0.1));

    // Update ion balance based on channel activity
    const ionBalance = { ...this.homeostasisMetrics.ionBalance };
    for (const channel of this.channels) {
      if (channel.isOpen && channel.type in ionBalance) {
        ionBalance[channel.type] += channel.conductance * timeDelta * 0.1;
      }
    }

    return {
      pH: Math.max(6, Math.min(9, pH)),
      temperature: Math.max(20, Math.min(100, temperature)),
      pressure,
      ionBalance,
      timestamp: new Date().toISOString()
    };
  }

  private async regulatePH(currentPH: number): Promise<void> {
    // pH regulation (like cellular buffering systems)
    if (currentPH < 7.0) {
      // Too acidic - open basic channels
      const basicChannels = this.channels.filter(c => c.type === 'potassium');
      basicChannels.forEach(c => c.isOpen = true);
    } else if (currentPH > 7.8) {
      // Too basic - regulate with sodium channels
      const acidicChannels = this.channels.filter(c => c.type === 'sodium');
      acidicChannels.forEach(c => {
        if (c.gateVoltage && c.gateVoltage > -60) {
          c.isOpen = true;
        }
      });
    }
  }

  private async coolSystem(): Promise<void> {
    // System cooling (like cellular heat shock response)
    // Reduce channel conductance to slow processing
    this.channels.forEach(channel => {
      channel.conductance *= 0.9;
    });
    
    // Open calcium channels for stress response
    const calciumChannels = this.channels.filter(c => c.type === 'calcium');
    calciumChannels.forEach(c => c.isOpen = true);
  }

  private async reduceSystemLoad(): Promise<void> {
    // Reduce system pressure by closing non-essential channels
    const nonEssentialChannels = this.channels.filter(c => 
      c.type !== 'energy' && c.type !== 'data'
    );
    
    nonEssentialChannels.forEach(channel => {
      if (Math.random() > 0.5) {
        channel.isOpen = false;
      }
    });
  }

  private async balanceIons(ionBalance: Record<string, number>): Promise<void> {
    // Ion balance regulation (like Na+/K+ pumps)
    const target = {
      sodium: 145,
      potassium: 5,
      calcium: 2.5,
      data: 100,
      energy: 80
    };

    for (const [ion, current] of Object.entries(ionBalance)) {
      const targetValue = target[ion as keyof typeof target];
      if (targetValue && Math.abs(current - targetValue) > targetValue * 0.2) {
        // Significant imbalance - adjust channel activity
        const relevantChannels = this.channels.filter(c => c.type === ion);
        relevantChannels.forEach(channel => {
          if (current > targetValue) {
            // Too much - reduce conductance
            channel.conductance *= 0.95;
          } else {
            // Too little - increase conductance
            channel.conductance = Math.min(1, channel.conductance * 1.05);
          }
        });
      }
    }
  }

  private findFacilitatedChannel(data: any): MembraneChannel | undefined {
    // Find channel for facilitated diffusion
    return this.channels.find(c => c.isOpen && c.conductance > 0.5);
  }

  private async processAlongGradient(data: any, gradient: string, channel: MembraneChannel): Promise<any> {
    // Process data along concentration gradient
    const processed = { ...data };
    
    if (gradient === 'high-to-low') {
      // Easy transport - enhance efficiency
      processed._transport = {
        type: 'facilitated_diffusion',
        gradient: 'favorable',
        efficiency: channel.conductance * 1.2
      };
    } else {
      // Against gradient - requires more processing
      processed._transport = {
        type: 'facilitated_diffusion',
        gradient: 'unfavorable',
        efficiency: channel.conductance * 0.8
      };
    }
    
    return processed;
  }

  private getActiveTransportChannel(destination: string): MembraneChannel {
    // Get or create active transport channel
    let channel = this.channels.find(c => c.id === `active-${destination}`);
    
    if (!channel) {
      channel = {
        id: `active-${destination}`,
        type: 'energy',
        isOpen: true,
        selectivity: [destination],
        conductance: 1.0
      };
      this.channels.push(channel);
    }
    
    return channel;
  }

  private async getAvailableATP(): Promise<number> {
    // Mock ATP availability - would integrate with MitochondriaProcessor
    return 100; // Assume sufficient ATP for now
  }

  private async consumeATP(amount: number): Promise<void> {
    // Mock ATP consumption
    console.log(`🧬 Consuming ${amount} ATP for active transport`);
  }

  private async activelyTransport(data: any, channel: MembraneChannel): Promise<any> {
    // Active transport against gradients
    return {
      ...data,
      _transport: {
        type: 'active_transport',
        channel: channel.id,
        energyCost: 'high',
        timestamp: new Date().toISOString()
      }
    };
  }

  private startHomeostasisMonitoring(): void {
    // Continuous homeostasis monitoring
    setInterval(async () => {
      await this.maintainHomeostasis();
    }, 60000); // Every minute
  }
}
